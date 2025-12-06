import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth/admin';
import { logger } from '@/lib/utils/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user || !user.email) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı' }, { status: 401 });
    }

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    // Get all users from auth
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    let authUsers: any[] = [];
    try {
      const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
      if (!listError && users) {
        authUsers = users;
      }
    } catch (err) {
      logger?.warn?.('Could not fetch auth users:', err);
    }

    // Get all user profiles using service role key for admin access
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      logger?.error?.('Error fetching profiles:', profilesError);
      return NextResponse.json({ 
        error: 'Kullanıcılar alınamadı', 
        details: profilesError.message 
      }, { status: 500 });
    }

    logger?.info?.('Fetched profiles:', { count: profiles?.length || 0 });

    // Combine auth users with profiles
    const usersWithProfiles = (profiles || []).map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id);
      return {
        id: profile.id,
        email: authUser?.email || 'N/A',
        full_name: profile.full_name || 'N/A',
        specialty: profile.specialty || 'N/A',
        is_verified: profile.is_verified || false,
        created_at: profile.created_at,
        institution_name: profile.institution_name || 'N/A',
      };
    });

    logger?.info?.('Returning users:', { count: usersWithProfiles.length });
    return NextResponse.json({ users: usersWithProfiles }, { status: 200 });
  } catch (error: unknown) {
    logger?.error?.('Error in admin users route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

