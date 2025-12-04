import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    
    const body = await request.json();
    const userId = body.user_id;
    const photoUrl = body.photo_url;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL gerekli' }, { status: 400 });
    }

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found or access denied' },
        { status: 404 }
      );
    }

    // Insert post-op photo
    const { data: photoData, error: photoError } = await supabase
      .from('case_photos')
      .insert({
        case_id: params.id,
        type: 'postop',
        url: photoUrl,
      })
      .select()
      .single();

    if (photoError || !photoData) {
      return NextResponse.json(
        { error: 'Fotoğraf kaydedilemedi', details: photoError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { photo: photoData, message: 'Post-op fotoğraf başarıyla eklendi' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Post-op upload error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error.message },
      { status: 500 }
    );
  }
}

