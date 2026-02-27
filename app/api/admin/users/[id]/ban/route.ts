import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth/admin';
import { logger } from '@/lib/utils/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { reason, banUntil } = body;

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

    // Use service role key to bypass RLS
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const updateData: Record<string, unknown> = {
      is_banned: true,
      ban_reason: reason || 'Yönetici tarafından yasaklandı',
      banned_at: new Date().toISOString(),
      banned_by: user.id,
    };

    if (banUntil) {
      updateData.banned_until = new Date(banUntil).toISOString();
    }

    const { data, error } = await adminSupabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger?.error?.('Error banning user:', error);
      return NextResponse.json({ 
        error: 'Kullanıcı yasaklanamadı', 
        details: error.message 
      }, { status: 500 });
    }

    logger?.info?.('User banned:', { userId, reason, bannedBy: user.email });
    return NextResponse.json({ success: true, user: data }, { status: 200 });
  } catch (error: unknown) {
    logger?.error?.('Error in ban user route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

