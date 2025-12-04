import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { registerSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createServerClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm for now (you may want to add email verification)
      user_metadata: {
        full_name: data.full_name,
        tc_kimlik_no: data.tc_kimlik_no,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı', details: authError?.message },
        { status: 400 }
      );
    }

    // Upload institution card to storage if provided
    let institutionCardUrl: string | null = null;
    if (body.institution_card_file) {
      // Note: In a real implementation, you'd handle file upload here
      // For now, we assume the file URL is provided or handled client-side
      // You might want to use FormData and handle multipart/form-data
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        full_name: data.full_name,
        tc_kimlik_no: data.tc_kimlik_no,
        specialty: data.specialty,
        institution_name: data.institution_name,
        institution_email: data.institution_email,
        phone: data.phone,
        role: 'physician',
        is_verified: false, // Will be verified by admin
        institution_id_card_url: institutionCardUrl,
      });

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Profil oluşturulamadı', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Kayıt başarılı. Hesabınız doğrulama bekliyor.',
        user_id: authData.user.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

