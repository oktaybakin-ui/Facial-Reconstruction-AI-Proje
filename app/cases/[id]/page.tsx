'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CaseDetailContent from './CaseDetailContent';
import { getSignedPhotoUrls } from '@/lib/actions/storage';
import type { Case, CasePhoto } from '@/types/cases';
import type { AIResult } from '@/types/ai';
import Link from 'next/link';

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [photos, setPhotos] = useState<CasePhoto[]>([]);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [caseId]);

  const loadData = async () => {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No session, redirecting to login');
        router.push('/auth/login');
        return;
      }

      setUserId(session.user.id);

      // Fetch case data
      const { data: caseDataResult, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .eq('user_id', session.user.id)
        .single();

      if (caseError || !caseDataResult) {
        console.error('Case not found:', caseError);
        setError('Olgu bulunamadı');
        setLoading(false);
        return;
      }

      setCaseData(caseDataResult as Case);

      // Fetch photos (bucket is now public, so URLs should work directly)
      const { data: photosData, error: photosError } = await supabase
        .from('case_photos')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Photos fetch error:', photosError);
      }

      // Resolve storage paths/URLs to signed URLs for secure display
      if (photosData && photosData.length > 0) {
        try {
          const urls = photosData.map((p: CasePhoto) => p.url).filter(Boolean);
          const signedUrls = await getSignedPhotoUrls(urls);
          const resolvedPhotos = photosData.map((p: CasePhoto) => ({
            ...p,
            url: signedUrls[p.url] || p.url,
          }));
          setPhotos(resolvedPhotos as CasePhoto[]);
        } catch (e) {
          console.error('Signed URL resolution failed, using raw URLs:', e);
          setPhotos((photosData || []) as CasePhoto[]);
        }
      } else {
        setPhotos([]);
      }

      // Fetch AI result if exists (use maybeSingle to avoid error if no result)
      // Note: RLS policy ensures user can only see AI results for their own cases
      const { data: aiResultData, error: aiResultError } = await supabase
        .from('ai_results')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();

      if (aiResultError) {
        console.error('AI result query error:', aiResultError);
        console.error('Error details:', {
          message: aiResultError.message,
          details: aiResultError.details,
          hint: aiResultError.hint,
          code: aiResultError.code
        });
        // Don't set error, just log it - it's okay if no AI result exists yet
        // 406 error usually means RLS policy issue, but we handle it gracefully
      } else {
        console.log('AI result query successful:', aiResultData ? 'Result found' : 'No result yet');
      }

      if (aiResultData) {
        setAiResult(aiResultData as AIResult);
      }
    } catch (err: unknown) {
      console.error('Error loading case:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData || !userId) {
    console.error('Error rendering case detail:', { error, hasCaseData: !!caseData, hasUserId: !!userId, userId });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Olgu bulunamadı' || (!userId ? 'Kullanıcı kimliği yüklenemedi. Lütfen tekrar giriş yapın.' : 'Bilinmeyen hata')}
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    );
  }

  // Double-check userId is valid string
  if (typeof userId !== 'string' || userId.trim() === '') {
    console.error('Invalid userId:', userId);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">
            Geçersiz kullanıcı kimliği. Lütfen tekrar giriş yapın.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CaseDetailContent
      caseData={caseData}
      photos={photos}
      aiResult={aiResult}
      userId={userId}
    />
  );
}

