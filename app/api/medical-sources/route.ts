import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { requireAdmin, isAdmin } from '@/lib/auth/admin';
import type { MedicalSourceInput } from '@/types/medical';

// GET - Get all medical sources (available to everyone, but only admin sources are shown)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get all active medical sources (from all admins)
    // Normal users can view sources but cannot edit/delete them
    const { data, error } = await supabase
      .from('medical_sources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medical sources:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/medical-sources:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

// POST - Create a new medical source (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_email, ...sourceData } = body;

    if (!user_id || !user_email) {
      return NextResponse.json({ error: 'Kullanıcı kimliği ve email gerekli' }, { status: 400 });
    }

    // Check if user is admin
    try {
      requireAdmin(user_email);
    } catch (adminError: any) {
      return NextResponse.json({ 
        error: adminError.message || 'Bu işlem için yönetici yetkisi gereklidir' 
      }, { status: 403 });
    }

    if (!sourceData.title || !sourceData.content) {
      return NextResponse.json({ error: 'Başlık ve içerik gerekli' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('medical_sources')
      .insert({
        user_id,
        ...sourceData,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medical source:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/medical-sources:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

