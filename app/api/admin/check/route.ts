import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
    }

    const adminStatus = isAdmin(email);
    return NextResponse.json({ isAdmin: adminStatus }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

