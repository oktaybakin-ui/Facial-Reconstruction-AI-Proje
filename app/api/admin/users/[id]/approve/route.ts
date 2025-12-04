import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth/admin';
import { logger } from '@/lib/utils/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = params.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger?.error?.('Error approving user:', error);
      return NextResponse.json({ error: 'Kullanıcı onaylanamadı' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data }, { status: 200 });
  } catch (error: unknown) {
    logger?.error?.('Error in approve user route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

