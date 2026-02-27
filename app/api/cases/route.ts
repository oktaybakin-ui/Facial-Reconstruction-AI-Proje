import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { createCaseSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    
    // Validate input
    const validationResult = createCaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get user_id from body (passed from client-side authenticated session)
    // In production, validate JWT token from headers instead
    const userId = body.user_id;
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gerekli' }, { status: 401 });
    }

    // Verify user exists and is verified (optional check)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (!profile.is_verified) {
      return NextResponse.json(
        { error: 'Hesabınız henüz doğrulanmamış' },
        { status: 403 }
      );
    }

    // Create case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: userId,
        case_code: data.case_code,
        age: data.age,
        sex: data.sex,
        region: data.region,
        width_mm: data.width_mm,
        height_mm: data.height_mm,
        depth: data.depth,
        previous_surgery: data.previous_surgery,
        previous_radiotherapy: data.previous_radiotherapy,
        pathology_suspected: data.pathology_suspected,
        critical_structures: data.critical_structures || [],
        high_aesthetic_zone: data.high_aesthetic_zone,
        case_date: data.case_date || null,
        case_time: data.case_time || null,
        case_duration_minutes: data.case_duration_minutes || null,
        patient_special_condition: data.patient_special_condition || null,
        operation_date: data.operation_date || null,
        followup_days: data.followup_days || 21,
        status: 'planned',
      })
      .select()
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Olgu oluşturulamadı', details: caseError?.message },
        { status: 500 }
      );
    }

    // If pre-op photo URL is provided, create photo record
    if (data.preop_photo_url) {
      const { error: photoError } = await supabase
        .from('case_photos')
        .insert({
          case_id: caseData.id,
          type: 'preop',
          url: data.preop_photo_url,
        });

      if (photoError) {
        console.error('Photo insert error:', photoError);
        // Don't fail the whole request if photo insert fails
      }
    }

    return NextResponse.json(
      { case: caseData, message: 'Olgu başarıyla oluşturuldu' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create case error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: errorMessage },
      { status: 500 }
    );
  }
}

