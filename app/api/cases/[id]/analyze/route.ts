import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { runCaseAnalysis } from '@/lib/ai/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let caseId: string | undefined;
  
  try {
    const { id } = await params;
    caseId = id;
    
    const body = await request.json();
    const userId = body.user_id;
    const manualAnnotation = body.manual_annotation || null;
    const enable3D = body.enable_3d === true; // Explicitly check for true
    const faceImages3D = body.face_images_3d || null; // Array of 9 image URLs

    // Validate 3D mode requirements
    if (enable3D) {
      if (!faceImages3D || !Array.isArray(faceImages3D) || faceImages3D.length !== 9) {
        return NextResponse.json({
          error: '3D mod için 9 adet fotoğraf zorunludur',
          details: `Şu an yüklenen: ${faceImages3D?.length || 0} adet. 3D mod için tam olarak 9 adet farklı açıdan çekilmiş yüz fotoğrafı gereklidir.`,
        }, { status: 400 });
      }
    }

    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.error('No userId provided or invalid:', userId);
      return NextResponse.json({ 
        error: 'Kullanıcı kimliği gerekli',
        details: `Received userId: ${userId} (type: ${typeof userId})`
      }, { status: 401 });
    }

    if (!caseId || caseId === 'undefined' || caseId === 'null' || caseId.trim() === '') {
      return NextResponse.json({
        error: 'Case ID bulunamadı',
      }, { status: 400 });
    }

    // Run AI analysis (it will verify case ownership internally)
    const result = await runCaseAnalysis(
      caseId, 
      userId, 
      manualAnnotation,
      enable3D,
      faceImages3D
    );

    return NextResponse.json(
      { result, message: 'AI analizi tamamlandı' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Analyze error:', error);

    // More specific error messages
    const rawMessage = error instanceof Error ? error.message : String(error);
    let errorMessage = rawMessage || 'AI analizi başarısız';
    let hint = undefined;

    // Check for OpenAI API key errors
    if (rawMessage?.includes('OpenAI API key') || rawMessage?.includes('Incorrect API key') || rawMessage?.includes('401')) {
      errorMessage = 'OpenAI API key geçersiz veya eksik. Lütfen Vercel Dashboard\'da OPENAI_API_KEY environment variable\'ını kontrol edin.';
      hint = 'API key\'inizi https://platform.openai.com/account/api-keys adresinden alabilirsiniz.';
    } else if (rawMessage?.includes('quota') || rawMessage?.includes('rate limit') || rawMessage?.includes('429')) {
      errorMessage = 'OpenAI API quota/rate limit aşıldı.';
      hint = 'Lütfen https://platform.openai.com/account/billing adresinden quota durumunuzu kontrol edin.';
    } else if (rawMessage?.includes('Olgu bulunamadı') || rawMessage?.includes('Case not found') || rawMessage?.includes('not found')) {
      errorMessage = 'Olgu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
      hint = caseId ? `Aranan Case ID: ${caseId}` : 'Case ID bulunamadı';
    } else if (rawMessage?.includes('photo') || rawMessage?.includes('Pre-op')) {
      errorMessage = 'Pre-op fotoğraf bulunamadı. Lütfen önce pre-op fotoğraf yükleyin.';
      hint = 'Fotoğraf yüklemek için yeni olgu ekleme sayfasında fotoğraf seçin.';
    } else if (rawMessage?.includes('Access denied') || rawMessage?.includes('erişim yetkiniz')) {
      errorMessage = 'Bu olguya erişim yetkiniz yok.';
      hint = caseId ? `Case ID: ${caseId}` : undefined;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: rawMessage,
        hint: hint,
        caseId: caseId
      },
      { status: 500 }
    );
  }
}

