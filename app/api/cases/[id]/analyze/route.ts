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
    
    console.log('AI Analyze endpoint called for case:', caseId);
    console.log('Raw params:', params);
    console.log('Resolved params:', resolvedParams);
    
    const body = await request.json();
    const userId = body.user_id;
    const manualAnnotation = body.manual_annotation || null;

    console.log('Request body:', body);
    console.log('Extracted userId:', userId);
    console.log('Manual annotation received:', manualAnnotation);
    console.log('Manual annotation exists:', !!manualAnnotation);
    console.log('Type of userId:', typeof userId);

    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.error('No userId provided or invalid:', userId);
      return NextResponse.json({ 
        error: 'Kullanıcı kimliği gerekli',
        details: `Received userId: ${userId} (type: ${typeof userId})`
      }, { status: 401 });
    }

    if (!caseId || caseId === 'undefined' || caseId === 'null' || caseId.trim() === '') {
      console.error('No caseId in params or invalid:', caseId);
      return NextResponse.json({ 
        error: 'Case ID bulunamadı',
        details: `Received caseId: ${caseId} (type: ${typeof caseId})`
      }, { status: 400 });
    }

    console.log('User ID:', userId);
    console.log('Case ID:', caseId);

    // Run AI analysis (it will verify case ownership internally)
    const result = await runCaseAnalysis(caseId, userId, manualAnnotation);

    return NextResponse.json(
      { result, message: 'AI analizi tamamlandı' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Analyze error:', error);
    console.error('Error stack:', error.stack);
    console.error('Case ID used:', caseId);
    
    // More specific error messages
    let errorMessage = error.message || 'AI analizi başarısız';
    let hint = undefined;
    
    if (error.message?.includes('Olgu bulunamadı') || error.message?.includes('Case not found') || error.message?.includes('not found')) {
      errorMessage = 'Olgu bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
      hint = caseId ? `Aranan Case ID: ${caseId}` : 'Case ID bulunamadı';
    } else if (error.message?.includes('photo') || error.message?.includes('Pre-op')) {
      errorMessage = 'Pre-op fotoğraf bulunamadı. Lütfen önce pre-op fotoğraf yükleyin.';
      hint = 'Fotoğraf yüklemek için yeni olgu ekleme sayfasında fotoğraf seçin.';
    } else if (error.message?.includes('Access denied') || error.message?.includes('erişim yetkiniz')) {
      errorMessage = 'Bu olguya erişim yetkiniz yok.';
      hint = caseId ? `Case ID: ${caseId}` : undefined;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        hint: hint,
        caseId: caseId
      },
      { status: 500 }
    );
  }
}

