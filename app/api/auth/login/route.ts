import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { loginSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Giriş başarısız. E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    // Check if user is verified and not banned
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified, is_banned, ban_reason, banned_until')
      .eq('id', data.user.id)
      .single();

    const isVerified = profile?.is_verified ?? false;
    const isBanned = profile?.is_banned ?? false;
    
    // Check if temporary ban has expired
    let banActive = isBanned;
    if (isBanned && profile?.banned_until) {
      const banUntilDate = new Date(profile.banned_until);
      const now = new Date();
      if (now > banUntilDate) {
        // Ban expired, update database
        await supabase
          .from('user_profiles')
          .update({ 
            is_banned: false, 
            ban_reason: null, 
            banned_at: null, 
            banned_until: null,
            banned_by: null 
          })
          .eq('id', data.user.id);
        banActive = false;
      }
    }

    if (banActive) {
      return NextResponse.json(
        {
          error: profile?.ban_reason || 'Hesabınız yasaklanmıştır. Lütfen yönetici ile iletişime geçin.',
          is_banned: true,
          banned_until: profile?.banned_until || null,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: data.session,
        is_verified: isVerified,
        message: isVerified 
          ? 'Giriş başarılı' 
          : 'Hesabınız doğrulanmayı bekliyor',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: 'Sunucu hatası', details: errorMessage },
      { status: 500 }
    );
  }
}

