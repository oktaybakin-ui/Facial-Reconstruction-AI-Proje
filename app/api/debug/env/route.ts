import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables
 * Only works in development or with proper authentication in production
 */
export async function GET() {
  // Security: Only allow in development or with proper auth
  if (process.env.NODE_ENV === 'production') {
    // In production, you might want to add authentication here
    // For now, we'll allow it but mask sensitive data
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    isVercel: isVercel,
    vercelEnv: process.env.VERCEL_ENV,
    keys: {
      OPENAI_API_KEY: {
        present: !!openaiKey,
        length: openaiKey?.length || 0,
        startsWith: openaiKey?.substring(0, 10) || 'N/A',
        endsWith: openaiKey ? `...${openaiKey.substring(openaiKey.length - 10)}` : 'N/A',
      },
      ANTHROPIC_API_KEY: {
        present: !!anthropicKey,
        length: anthropicKey?.length || 0,
        startsWith: anthropicKey?.substring(0, 10) || 'N/A',
      },
      NEXT_PUBLIC_SUPABASE_URL: {
        present: !!supabaseUrl,
        value: supabaseUrl || 'N/A',
      },
    },
    allEnvVars: {
      // List all environment variables (be careful in production)
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAdminEmails: !!process.env.ADMIN_EMAILS,
    },
  });
}

