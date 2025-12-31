'use server';

import { createServerClient } from '@/lib/supabaseClient';
import { analyzeVision } from './vision';
import { suggestFlaps } from './decision';
import { reviewSafety } from './safety';
import { generate3DFaceModel } from './face3d';
import { getRelevantSourcesForCase, formatSourcesForPrompt } from '@/lib/medical/sources';
import type { AIResult, VisionSummary, FlapSuggestion, SafetyReview, Face3DModel } from '@/types/ai';
import type { Case } from '@/types/cases';

export async function runCaseAnalysis(
  caseId: string,
  userId: string,
  manualAnnotation?: {
    x: number;
    y: number;
    width: number;
    height: number;
    image_width: number;
    image_height: number;
  } | null,
  enable3D?: boolean,
  faceImages3D?: string[]
): Promise<AIResult> {
  // Validate inputs
  if (!caseId || caseId === 'undefined' || caseId.trim() === '') {
    throw new Error(`Geçersiz case ID: ${caseId}`);
  }
  
  if (!userId || userId === 'undefined' || userId.trim() === '') {
    throw new Error(`Geçersiz user ID: ${userId}`);
  }

  const supabase = createServerClient();

  // Fetch case data (service role bypasses RLS)
  console.log('Fetching case:', caseId, 'for user:', userId);
  console.log('Type check - caseId:', typeof caseId, 'userId:', typeof userId);
  
  // First, try to get case without user_id filter (service role can see all)
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  console.log('Case query result:', { 
    caseFound: !!caseData, 
    error: caseError?.message,
    caseUserId: caseData?.user_id,
    requestedUserId: userId
  });

  if (caseError) {
    console.error('Case query error:', caseError);
    throw new Error(`Veritabanı hatası: ${caseError.message}`);
  }

  if (!caseData) {
    throw new Error(`Olgu bulunamadı. Case ID: ${caseId}`);
  }

  // Verify ownership
  if (caseData.user_id !== userId) {
    console.error('User ID mismatch:', caseData.user_id, 'vs', userId);
    throw new Error(`Bu olguya erişim yetkiniz yok. Olgu farklı bir kullanıcıya ait.`);
  }

  // Fetch pre-op photo
  console.log('Fetching pre-op photos for case:', caseId);
  console.log('Case ID for photo query:', caseId, 'type:', typeof caseId);
  
  // Double-check caseId is valid UUID before querying
  if (!caseId || typeof caseId !== 'string' || caseId.trim() === '' || caseId === 'undefined') {
    throw new Error(`Geçersiz case ID for photo query: ${caseId}`);
  }
  
  const { data: photos, error: photoError } = await supabase
    .from('case_photos')
    .select('url, case_id, type')
    .eq('case_id', caseId.trim())
    .eq('type', 'preop')
    .order('created_at', { ascending: false })
    .limit(1);

  console.log('Photos query result:', { 
    photosFound: photos?.length || 0, 
    photos: photos,
    photoError: photoError?.message,
    queryCaseId: caseId
  });

  if (photoError) {
    throw new Error(`Photo query failed: ${photoError.message}`);
  }

  if (!photos || photos.length === 0) {
    throw new Error('Pre-operative photo not found. Lütfen önce pre-op fotoğraf yükleyin.');
  }

  const preopPhotoUrl = photos[0].url;
  if (!preopPhotoUrl) {
    throw new Error('Photo URL is invalid');
  }

  // Step 1: Vision analysis
  console.log('Starting Step 1: Vision analysis...');
  console.log('Image URL:', preopPhotoUrl);
  console.log('Manual annotation provided:', !!manualAnnotation, manualAnnotation);
  let visionSummary: VisionSummary;
  
  // If manual annotation exists, skip vision model entirely (we only use manual annotation)
  if (manualAnnotation) {
    console.log('🎯 Manual annotation provided - SKIPPING vision model, using manual annotation only');
    
    // Handle both rectangle and circle annotations
    const shape = (manualAnnotation as any).shape || 'rectangle';
    let centerX: number, centerY: number, width: number, height: number, points: Array<{ x: number; y: number }>;
    
    if (shape === 'circle') {
      // Circle: calculate center and radius
      centerX = manualAnnotation.x + (manualAnnotation.width / 2);
      centerY = manualAnnotation.y + (manualAnnotation.height / 2);
      const radius = Math.max(Math.abs(manualAnnotation.width), Math.abs(manualAnnotation.height)) / 2;
      width = radius * 2;
      height = radius * 2;
      
      // Generate polygon points for circle (approximate with 16 points)
      const numPoints = 16;
      points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        points.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      }
    } else {
      // Rectangle: standard calculation
      centerX = manualAnnotation.x + (manualAnnotation.width / 2);
      centerY = manualAnnotation.y + (manualAnnotation.height / 2);
      width = manualAnnotation.width;
      height = manualAnnotation.height;
      points = [
        { x: manualAnnotation.x, y: manualAnnotation.y },
        { x: manualAnnotation.x + manualAnnotation.width, y: manualAnnotation.y },
        { x: manualAnnotation.x + manualAnnotation.width, y: manualAnnotation.y + manualAnnotation.height },
        { x: manualAnnotation.x, y: manualAnnotation.y + manualAnnotation.height },
      ];
    }
    
    // Create vision summary using case metadata and manual annotation
    visionSummary = {
      detected_region: caseData.region || 'Belirtilmemiş',
      estimated_width_mm: caseData.width_mm || 0,
      estimated_height_mm: caseData.height_mm || 0,
      depth_estimation: caseData.depth || 'Belirtilmemiş',
      critical_structures: caseData.critical_structures || [],
      aesthetic_zone: caseData.high_aesthetic_zone ?? false,
      defect_location: {
        center_x: centerX,
        center_y: centerY,
        width: width,
        height: height,
        points: points,
      },
    };
    console.log('✅ Created vision summary with manual annotation ONLY:', visionSummary);
    console.log(`⚠️ Vision model was SKIPPED - using only manual annotation (shape: ${shape})`);
  } else {
    // No manual annotation, need vision model
    try {
      visionSummary = await analyzeVision(preopPhotoUrl, caseData as Case);
      console.log('✅ Vision analysis completed');
    } catch (error: any) {
      console.error('❌ Vision analysis failed:', error);
      console.error('Error stack:', error?.stack);
      const errorMsg = error?.message || 'Bilinmeyen hata';
      const errorDetails = error?.response ? JSON.stringify(error?.response) : '';
      throw new Error(`Görüntü analizi başarısız: ${errorMsg}${errorDetails ? ` | Detay: ${errorDetails}` : ''}`);
    }
  }
  
  // defect_location is already set from manual annotation above, so no need to override again
  if (manualAnnotation) {
    console.log('✅ defect_location already set from manual annotation:', visionSummary.defect_location);
  } else {
    console.log('ℹ️ No manual annotation provided, using vision-detected location');
  }

    // Step 1.5: Get relevant medical sources for this case
    console.log('Starting Step 1.5: Fetching relevant medical sources...');
    let medicalSourcesContext = '';
    try {
      const relevantSources = await getRelevantSourcesForCase(
        userId,
        caseData.region,
        caseData.critical_structures
      );
      if (relevantSources.length > 0) {
        medicalSourcesContext = formatSourcesForPrompt(relevantSources);
        console.log(`✅ Found ${relevantSources.length} relevant medical sources`);
      } else {
        console.log('ℹ️ No relevant medical sources found for this case');
      }
    } catch (error: any) {
      console.warn('⚠️ Could not fetch medical sources, continuing without them:', error.message);
      // Don't fail the whole analysis if sources can't be fetched
    }

    // Step 2: Flap decision suggestions (with medical sources context)
    console.log('Starting Step 2: Flap decision suggestions...');
    let flapSuggestions: FlapSuggestion[];
    try {
      flapSuggestions = await suggestFlaps(caseData as Case, visionSummary, medicalSourcesContext);
      console.log('✅ Flap suggestions completed:', flapSuggestions.length, 'suggestions');
      if (flapSuggestions.length === 0) {
        throw new Error('Hiç flep önerisi oluşturulamadı');
      }
    } catch (error: any) {
    console.error('❌ Flap suggestion failed:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error response:', error?.response);
    const errorMsg = error?.message || 'Bilinmeyen hata';
    const errorDetails = error?.response ? JSON.stringify(error?.response) : '';
    throw new Error(`Flep önerisi başarısız: ${errorMsg}${errorDetails ? ` | Detay: ${errorDetails}` : ''}`);
  }

  // Step 3: Safety review (optional - if fails, continue without it)
  console.log('Starting Step 3: Safety review...');
  let safetyResult;
  try {
    safetyResult = await reviewSafety(visionSummary, flapSuggestions);
    console.log('✅ Safety review completed');
  } catch (error: any) {
    console.error('❌ Safety review failed:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error response:', error?.response);
    
    // If safety review fails due to API issues, create a minimal safety review
    const errorMsg = error?.message || 'Bilinmeyen hata';
    const isCreditError = errorMsg.includes('credit') || errorMsg.includes('balance') || errorMsg.includes('billing');
    
    if (isCreditError) {
      console.warn('⚠️ Safety review skipped due to Anthropic API credit issue. Continuing with minimal safety review...');
      // Create minimal safety review so analysis can complete
      safetyResult = {
        hallucination_risk: 'orta' as const,
        comments: ['Güvenlik incelemesi Anthropic API kredi sorunu nedeniyle atlandı. Lütfen manuel kontrol yapın.'],
        legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir. Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine geçmez.',
        flapSuggestions: flapSuggestions, // Use original suggestions without safety review
      };
    } else {
      // For other errors, create minimal safety review but log the error
      console.warn('⚠️ Safety review failed, using minimal safety review...');
      safetyResult = {
        hallucination_risk: 'orta' as const,
        comments: [`Güvenlik incelemesi tamamlanamadı: ${errorMsg}. Lütfen manuel kontrol yapın.`],
        legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir. Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine geçmez.',
        flapSuggestions: flapSuggestions,
      };
    }
  }
  const finalSuggestions = safetyResult.flapSuggestions;
  
  // Add 3D model warning to safety review if 3D mode is enabled
  let safetyReview: SafetyReview = {
    hallucination_risk: safetyResult.hallucination_risk,
    comments: safetyResult.comments,
    legal_disclaimer: safetyResult.legal_disclaimer,
  };

  // Step 3.5: 3D Face Reconstruction (if enabled)
  let face3DModel: Face3DModel | undefined = undefined;
  if (enable3D && faceImages3D && faceImages3D.length === 9) {
    console.log('Starting Step 3.5: 3D Face Reconstruction...');
    try {
      const reconstructionResult = await generate3DFaceModel(faceImages3D);
      
      face3DModel = {
        status: reconstructionResult.status,
        confidence: reconstructionResult.confidence,
        model_url: reconstructionResult.model_url,
        images_3d: faceImages3D,
      };

      if (reconstructionResult.status === 'completed') {
        console.log('✅ 3D face reconstruction completed');
      } else if (reconstructionResult.status === 'failed') {
        console.warn('⚠️ 3D face reconstruction failed:', reconstructionResult.error);
        // Continue with 2D analysis - don't fail the whole pipeline
      }

      // Add 3D model warning to safety review
      const warning3D = 'Uyarı: Bu 3D yüz modeli, fotoğraflardan yapay zekâ ile tahmin edilmiştir. Gerçek cerrahi ölçüm yerine geçmez. Sadece karar destek ve görselleştirme amaçlıdır.';
      safetyReview.comments = [
        ...safetyReview.comments,
        warning3D,
      ];
    } catch (error: any) {
      console.error('❌ 3D face reconstruction failed:', error);
      // Mark as failed but continue with 2D analysis
      face3DModel = {
        status: 'failed',
        confidence: 'düşük',
        model_url: null,
        images_3d: faceImages3D,
      };
      
      // Add warning to safety review
      const warning3D = 'Uyarı: 3D yüz modeli oluşturulamadı. Analiz 2D modda devam etmektedir.';
      safetyReview.comments = [
        ...safetyReview.comments,
        warning3D,
      ];
    }
  } else if (enable3D) {
    // 3D enabled but images not provided or wrong count
    console.warn('⚠️ 3D mode enabled but invalid image count:', faceImages3D?.length || 0);
    face3DModel = {
      status: 'failed',
      confidence: 'düşük',
      model_url: null,
      images_3d: faceImages3D || [],
    };
  }

  // Step 4: Save to database (UPSERT - update if exists, insert if not)
  console.log('Saving AI result for case:', caseId);
  console.log('Case ID for save:', caseId, 'type:', typeof caseId);
  
  // Validate caseId again before saving
  if (!caseId || typeof caseId !== 'string' || caseId.trim() === '' || caseId === 'undefined') {
    throw new Error(`Geçersiz case ID for save: ${caseId}`);
  }
  
  const upsertData: any = {
    case_id: caseId.trim(),
    vision_summary: visionSummary,
    flap_suggestions: finalSuggestions,
    safety_review: safetyReview,
  };

  // Add 3D fields if 3D mode is enabled
  if (enable3D) {
    upsertData.enable_3d = true;
    upsertData.face_images_3d = faceImages3D || [];
    if (face3DModel) {
      upsertData.face_3d_status = face3DModel.status;
      upsertData.face_3d_confidence = face3DModel.confidence;
      upsertData.face_3d_model_url = face3DModel.model_url;
    }
  } else {
    upsertData.enable_3d = false;
  }
  
  console.log('Upsert data prepared:', { 
    case_id: upsertData.case_id, 
    hasVisionSummary: !!upsertData.vision_summary,
    hasFlapSuggestions: !!upsertData.flap_suggestions,
    hasSafetyReview: !!upsertData.safety_review
  });
  
  // Check if result already exists
  const { data: existingResult } = await supabase
    .from('ai_results')
    .select('id')
    .eq('case_id', caseId.trim())
    .maybeSingle();

  let aiResult;
  let saveError;

  if (existingResult) {
    // Delete existing record first, then insert new one (to avoid unique constraint error)
    console.log('Deleting existing AI result before inserting new one:', existingResult.id);
    const { error: deleteError } = await supabase
      .from('ai_results')
      .delete()
      .eq('case_id', caseId.trim());
    
    if (deleteError) {
      console.error('Error deleting existing result:', deleteError);
      // Continue anyway - try to insert, might work
    } else {
      console.log('Existing AI result deleted successfully');
    }
  }

  // Insert new record (after delete if existed)
  console.log('Inserting new AI result');
  const { data: insertedResult, error: insertError } = await supabase
    .from('ai_results')
    .insert(upsertData)
    .select()
    .single();
  
  aiResult = insertedResult;
  saveError = insertError;

  console.log('AI result save result:', { 
    success: !!aiResult, 
    error: saveError?.message,
    aiResultId: aiResult?.id,
    operation: existingResult ? 'replaced' : 'inserted'
  });

  if (saveError || !aiResult) {
    console.error('Save error details:', saveError);
    
    // If still duplicate key error after delete, there's a race condition
    // Try one more time after a short delay
    if (saveError?.message?.includes('duplicate key') || saveError?.message?.includes('unique constraint')) {
      console.log('Duplicate key error persists, retrying after delete...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { error: retryDeleteError } = await supabase
        .from('ai_results')
        .delete()
        .eq('case_id', caseId.trim());
      
      if (!retryDeleteError) {
        const { data: retryResult, error: retryError } = await supabase
          .from('ai_results')
          .insert(upsertData)
          .select()
          .single();
        
        if (retryResult && !retryError) {
          aiResult = retryResult;
          saveError = null;
          console.log('Retry successful after delete');
        }
      }
    }
    
    if (saveError || !aiResult) {
      throw new Error(`AI sonucu kaydedilemedi: ${saveError?.message || 'Bilinmeyen hata'}`);
    }
  }

  // Return formatted result
  const result: AIResult = {
    id: aiResult.id,
    case_id: caseId,
    vision_summary: visionSummary,
    flap_suggestions: finalSuggestions,
    safety_review: safetyReview,
    created_at: aiResult.created_at,
  };

  // Add 3D fields if available
  if (enable3D) {
    result.enable_3d = true;
    if (face3DModel) {
      result.face_3d = face3DModel;
    }
  }

  return result;
}

