import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/auth/admin';

// PUT - Update a medical source (ADMIN ONLY)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params;
    const body = await request.json();
    const { user_id, user_email, ...updates } = body;

    if (!user_id || !user_email) {
      return NextResponse.json({ error: 'Kullanıcı kimliği ve email gerekli' }, { status: 400 });
    }

    // Check if user is admin
    try {
      requireAdmin(user_email);
    } catch (adminError: unknown) {
      const adminErrorMessage = adminError instanceof Error ? adminError.message : 'Bu işlem için yönetici yetkisi gereklidir';
      return NextResponse.json({
        error: adminErrorMessage
      }, { status: 403 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('medical_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating medical source:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Kaynak bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ source: data }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in PUT /api/medical-sources/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete a medical source (soft delete) (ADMIN ONLY)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params;

    // Get user email from query params
    const searchParams = request.nextUrl.searchParams;
    const userEmail = searchParams.get('user_email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Kullanıcı email gerekli' }, { status: 400 });
    }

    // Check if user is admin
    try {
      requireAdmin(userEmail);
    } catch (adminError: unknown) {
      const adminErrorMessage = adminError instanceof Error ? adminError.message : 'Bu işlem için yönetici yetkisi gereklidir';
      return NextResponse.json({
        error: adminErrorMessage
      }, { status: 403 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('medical_sources')
      .update({ is_active: false })
      .eq('id', sourceId);

    if (error) {
      console.error('Error deleting medical source:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Kaynak silindi' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/medical-sources/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

