import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
    }

    // Get admin emails from environment (server-side)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const emailLower = email.toLowerCase();
    const adminStatus = adminEmails.includes(emailLower);

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin check:', {
        email: emailLower,
        adminEmails,
        isAdmin: adminStatus,
        hasEnvVar: !!process.env.ADMIN_EMAILS,
      });
    }

    return NextResponse.json({ 
      isAdmin: adminStatus,
      email: emailLower,
      // Only return admin emails count in development for debugging
      ...(process.env.NODE_ENV === 'development' && { adminEmailsCount: adminEmails.length })
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

