'use server';

import { createServerClient } from '@/lib/supabaseClient';
import { analyzeVision, extractAnatomicalLandmarks } from './vision';
import { suggestFlaps } from './decision';
import { reviewSafety } from './safety';
import { generate3DFaceModel } from './face3d';
import { validateFlapDrawing } from './validation';
import { generateCorrectionSuggestions, applyCorrections } from './postprocessing';
import { getRelevantSourcesForCase, formatSourcesForPrompt } from '@/lib/medical/sources';
import { resolveStorageUrl } from '@/lib/actions/storage';
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

  // First, try to get case without user_id filter (service role can see all)
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

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

  if (photoError) {
    throw new Error(`Photo query failed: ${photoError.message}`);
  }

  if (!photos || photos.length === 0) {
    throw new Error('Pre-operative photo not found. Lütfen önce pre-op fotoğraf yükleyin.');
  }

  const rawPhotoUrl = photos[0].url;
  if (!rawPhotoUrl) {
    throw new Error('Photo URL is invalid');
  }

  // Resolve storage path to signed URL (works for both legacy public URLs and new paths)
  const preopPhotoUrl = await resolveStorageUrl(rawPhotoUrl, 'case-photos', 600);

  // Step 1: Vision analysis
  let visionSummary: VisionSummary;
  
  // If manual annotation exists, skip vision model entirely (we only use manual annotation)
  if (manualAnnotation) {
    
    // Handle both rectangle and circle annotations
    const shape = (manualAnnotation as Record<string, unknown>).shape || 'rectangle';
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
  } else {
    // No manual annotation, need vision model
    try {
      visionSummary = await analyzeVision(preopPhotoUrl, caseData as Case);
    } catch (error: unknown) {
      console.error('Vision analysis failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      throw new Error(`Görüntü analizi başarısız: ${errorMsg}`);
    }
  }
  
    // Step 1.25 + 1.5: Run landmark extraction AND medical sources lookup in PARALLEL
    const [landmarkResult, sourcesResult] = await Promise.allSettled([
      // Landmark extraction
      (!visionSummary.anatomical_landmarks && preopPhotoUrl)
        ? extractAnatomicalLandmarks(preopPhotoUrl)
        : Promise.resolve(undefined),
      // Medical sources lookup
      getRelevantSourcesForCase(
        userId,
        caseData.region,
        caseData.critical_structures,
        caseData.critical_structures,
        `${caseData.region} ${caseData.pathology_suspected || ''} ${caseData.depth || ''}`
      ),
    ]);

    // Process landmark result
    if (landmarkResult.status === 'fulfilled' && landmarkResult.value) {
      visionSummary.anatomical_landmarks = landmarkResult.value;
    } else if (landmarkResult.status === 'rejected') {
      console.warn('⚠️ Anatomical landmark extraction failed, continuing without:', landmarkResult.reason);
    }

    // Process medical sources result
    let medicalSourcesContext = '';
    if (sourcesResult.status === 'fulfilled' && sourcesResult.value.length > 0) {
      medicalSourcesContext = formatSourcesForPrompt(sourcesResult.value);
    } else if (sourcesResult.status === 'rejected') {
      console.warn('⚠️ Could not fetch medical sources, continuing without them:', sourcesResult.reason);
    }

    // Step 2: Flap decision suggestions (with medical sources context)
    let flapSuggestions: FlapSuggestion[];
    try {
      flapSuggestions = await suggestFlaps(caseData as Case, visionSummary, medicalSourcesContext);
      if (flapSuggestions.length === 0) {
        throw new Error('Hiç flep önerisi oluşturulamadı');
      }
    } catch (error: unknown) {
    console.error('Flap suggestion failed:', error);
    const errObj = error as Record<string, unknown>;
    const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorDetails = errObj?.response ? JSON.stringify(errObj.response) : '';
    throw new Error(`Flep önerisi başarısız: ${errorMsg}${errorDetails ? ` | Detay: ${errorDetails}` : ''}`);
  }

  // Step 3 + 3.5: Run safety review AND validation in PARALLEL for speed
  const minimalSafetyReview = {
    hallucination_risk: 'orta' as const,
    comments: ['Güvenlik incelemesi tamamlanamadı. Lütfen manuel kontrol yapın.'],
    legal_disclaimer: 'Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı değerlendiren klinik ekibe aittir. Bu platform klinik muayene, cerrahi deneyim ve multidisipliner değerlendirmelerin yerine geçmez.',
    flapSuggestions: flapSuggestions,
  };

  const [safetySettled, validationSettled] = await Promise.allSettled([
    // Safety review
    reviewSafety(visionSummary, flapSuggestions).catch((error: unknown) => {
      console.error('Safety review failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      return {
        ...minimalSafetyReview,
        comments: [`Güvenlik incelemesi tamamlanamadı: ${errorMsg}. Lütfen manuel kontrol yapın.`],
      };
    }),
    // Validation (parallel with safety - no dependency)
    Promise.all(flapSuggestions.map(async (flap) => {
      if (!flap.flap_drawing || !preopPhotoUrl) return flap;
      try {
        const validationResult = await validateFlapDrawing(preopPhotoUrl, flap, visionSummary, 1000, 1000);
        let resultFlap = { ...flap, validation: validationResult };

        // Auto-correction for critical issues
        const criticalIssues = validationResult.detectedIssues?.filter(
          (i: { severity: string }) => i.severity === 'yüksek'
        ) || [];

        if (criticalIssues.length > 0) {
          try {
            const corrections = generateCorrectionSuggestions(validationResult, flap, visionSummary);
            if (corrections.length > 0) {
              const corrected = applyCorrections(flap, corrections);
              resultFlap = { ...corrected, validation: validationResult };
              console.info(`✅ Auto-correction applied for flap "${flap.flap_name}": ${criticalIssues.length} critical issues`);
            }
          } catch (correctionError: unknown) {
            console.warn(`⚠️ Auto-correction failed for flap ${flap.flap_name}:`, correctionError instanceof Error ? correctionError.message : String(correctionError));
          }
        }
        return resultFlap;
      } catch (validationError: unknown) {
        console.warn(`⚠️ Validation failed for flap ${flap.flap_name}:`, validationError instanceof Error ? validationError.message : String(validationError));
        return flap;
      }
    })).catch(() => flapSuggestions),
  ]);

  // Merge results: safety review modifies suggestions, validation adds validation data
  const safetyResult = safetySettled.status === 'fulfilled' ? safetySettled.value : minimalSafetyReview;
  const validatedFlaps = validationSettled.status === 'fulfilled' ? validationSettled.value : flapSuggestions;

  // Merge safety-reviewed suggestions with validation data
  const safetySuggestions = safetyResult.flapSuggestions || flapSuggestions;
  let finalSuggestions: FlapSuggestion[] = safetySuggestions.map((safeFlap, idx) => {
    const validated = validatedFlaps[idx];
    if (validated && 'validation' in validated) {
      return { ...safeFlap, validation: validated.validation } as FlapSuggestion;
    }
    return safeFlap;
  });
  
  // Add 3D model warning to safety review if 3D mode is enabled
  const safetyReview: SafetyReview = {
    hallucination_risk: safetyResult.hallucination_risk,
    comments: safetyResult.comments,
    legal_disclaimer: safetyResult.legal_disclaimer,
  };

  // Step 3.5: 3D Face Reconstruction (if enabled)
  let face3DModel: Face3DModel | undefined = undefined;
  if (enable3D && faceImages3D && faceImages3D.length === 9) {
    try {
      const reconstructionResult = await generate3DFaceModel(faceImages3D, caseId);
      
      face3DModel = {
        status: reconstructionResult.status,
        confidence: reconstructionResult.confidence,
        model_url: reconstructionResult.model_url,
        images_3d: faceImages3D,
      };

      if (reconstructionResult.status === 'completed') {
        // 3D reconstruction completed successfully
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
    } catch (error: unknown) {
      console.error('3D face reconstruction failed:', error);
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

  // Validate caseId again before saving
  if (!caseId || typeof caseId !== 'string' || caseId.trim() === '' || caseId === 'undefined') {
    throw new Error(`Geçersiz case ID for save: ${caseId}`);
  }
  
  const upsertData: Record<string, unknown> = {
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
  
  // Atomic upsert - replaces delete+insert race condition
  const { data: aiResult, error: saveError } = await supabase
    .from('ai_results')
    .upsert(upsertData, { onConflict: 'case_id' })
    .select()
    .single();

  if (saveError || !aiResult) {
    console.error('Save error details:', saveError);
    throw new Error(`AI sonucu kaydedilemedi: ${saveError?.message || 'Bilinmeyen hata'}`);
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

