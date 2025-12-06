import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';
import { createCaseSchema } from '@/lib/validators';

// GET - Get a specific case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;

    const supabase = createServerClient();
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      return NextResponse.json({ error: 'Olgu bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ case: caseData }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching case:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

// PUT - Update a case
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const body = await request.json();
    const { user_id, ...updateData } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gerekli' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verify user owns this case
    const { data: existingCase } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single();

    if (!existingCase) {
      return NextResponse.json({ error: 'Olgu bulunamadı' }, { status: 404 });
    }

    if (existingCase.user_id !== user_id) {
      return NextResponse.json({ error: 'Bu olguya erişim yetkiniz yok' }, { status: 403 });
    }

    // Validate input
    const validationResult = createCaseSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update(validationResult.data)
      .eq('id', caseId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError || !updatedCase) {
      return NextResponse.json(
        { error: 'Olgu güncellenemedi', details: updateError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { case: updatedCase, message: 'Olgu başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating case:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

// DELETE - Delete a case
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı kimliği gerekli' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verify user owns this case
    const { data: existingCase } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single();

    if (!existingCase) {
      return NextResponse.json({ error: 'Olgu bulunamadı' }, { status: 404 });
    }

    if (existingCase.user_id !== userId) {
      return NextResponse.json({ error: 'Bu olguya erişim yetkiniz yok' }, { status: 403 });
    }

    // Delete case photos first (cascade should handle this, but being explicit)
    await supabase
      .from('case_photos')
      .delete()
      .eq('case_id', caseId);

    // Delete AI results
    await supabase
      .from('ai_results')
      .delete()
      .eq('case_id', caseId);

    // Delete the case
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId)
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Olgu silinemedi', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Olgu başarıyla silindi' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting case:', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen hata' }, { status: 500 });
  }
}

