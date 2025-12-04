import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth/admin';
import { logger } from '@/lib/utils/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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

    const autoApproveEnabled = process.env.AUTO_APPROVE_USERS === 'true';
    return NextResponse.json({ enabled: autoApproveEnabled }, { status: 200 });
  } catch (error: unknown) {
    logger?.error?.('Error in auto-approve GET route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { enabled } = await request.json();
    // Note: This is a simple in-memory setting. For production, use a database or config service.
    process.env.AUTO_APPROVE_USERS = enabled ? 'true' : 'false';

    return NextResponse.json({ success: true, enabled }, { status: 200 });
  } catch (error: unknown) {
    logger?.error?.('Error in auto-approve POST route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

