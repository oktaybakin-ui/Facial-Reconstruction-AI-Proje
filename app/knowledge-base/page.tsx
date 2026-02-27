'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import type { MedicalSource } from '@/types/medical';

/* ------------------------------------------------------------------ */
/*  SVG Icon components                                                */
/* ------------------------------------------------------------------ */

function IconBook({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function IconPlus({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconUpload({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function IconPencil({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconTrash({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconDocument({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconBeaker({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function IconClipboard({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}

function IconDocumentText({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconShield({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconInfo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function IconHome({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconChevronRight({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function IconInbox({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Source type helpers                                                 */
/* ------------------------------------------------------------------ */

const SOURCE_TYPE_META: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  article: { label: 'Makale', icon: IconDocument, color: 'bg-cyan-50 text-cyan-700' },
  book:    { label: 'Kitap', icon: IconBook, color: 'bg-indigo-50 text-indigo-700' },
  guideline: { label: 'Kilavuz', icon: IconClipboard, color: 'bg-amber-50 text-amber-700' },
  research:  { label: 'Arastirma', icon: IconBeaker, color: 'bg-emerald-50 text-emerald-700' },
  pdf:     { label: 'PDF', icon: IconDocumentText, color: 'bg-rose-50 text-rose-700' },
  text:    { label: 'Metin', icon: IconDocumentText, color: 'bg-slate-100 text-slate-700' },
};

function getSourceMeta(type: string) {
  return SOURCE_TYPE_META[type] || SOURCE_TYPE_META.text;
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [sources, setSources] = useState<MedicalSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);

    // Check admin status via API
    if (user.email) {
      try {
        const response = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setIsUserAdmin(data.isAdmin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }

    fetchSources();
  };

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/medical-sources');
      if (!response.ok) throw new Error('Kaynaklar alinamadi');
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error: unknown) {
      console.error('Error fetching sources:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Bu kaynagi silmek istediginize emin misiniz?')) return;

    if (!isUserAdmin) {
      alert('Bu islem icin yonetici yetkisi gereklidir.');
      return;
    }

    try {
      const response = await fetch(`/api/medical-sources/${sourceId}?user_email=${encodeURIComponent(user?.email || '')}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kaynak silinemedi');
      }

      setSources(sources.filter(s => s.id !== sourceId));
      alert('Kaynak basariyla silindi');
    } catch (error: unknown) {
      console.error('Error deleting source:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-700 text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </span>
              Facial Reconstruction AI
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                Dashboard
              </Link>
              <Link href="/knowledge-base" className="px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 rounded-lg">
                Bilgi Tabani
              </Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="ml-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cikis
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <IconHome className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium">Bilgi Tabani</span>
        </nav>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700">
                <IconBook className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Tibbi Bilgi Tabani</h1>
            </div>
            <p className="text-slate-500 text-sm max-w-xl">
              AI&apos;in analizlerinde kullanacagi tibbi kaynaklar. Bu kaynaklar flep onerilerini destekler.
            </p>
            {isUserAdmin ? (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-600 font-medium">
                <IconShield className="h-4 w-4" />
                <span>Yonetici olarak kaynak ekleyebilirsiniz</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-400">
                <IconInfo className="h-4 w-4" />
                <span>Kaynak ekleme/duzenleme sadece yoneticiler tarafindan yapilabilir</span>
              </div>
            )}
          </div>
          {isUserAdmin && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/knowledge-base/bulk-upload">
                <Button variant="secondary" size="md">
                  <IconUpload className="h-4 w-4" />
                  Toplu Yukleme
                </Button>
              </Link>
              <Link href="/knowledge-base/new">
                <Button variant="primary" size="md">
                  <IconPlus className="h-4 w-4" />
                  Yeni Kaynak Ekle
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-cyan-700 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-slate-500">Kaynaklar yukleniyor...</p>
          </div>
        ) : sources.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 text-slate-400">
                <IconInbox className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Henuz kaynak eklenmemis</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Tibbi kaynaklarinizi ekleyerek AI&apos;in flep onerilerini daha guvenilir ve kaynak bazli hale getirin.
            </p>
            {isUserAdmin ? (
              <Link href="/knowledge-base/new">
                <Button variant="primary" size="md">
                  <IconPlus className="h-4 w-4" />
                  Ilk Kaynaginizi Ekleyin
                </Button>
              </Link>
            ) : (
              <p className="text-sm text-slate-400">
                Kaynak eklemek icin yonetici yetkisi gereklidir.
              </p>
            )}
          </div>
        ) : (
          /* Source table / cards */
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="text-sm text-slate-500">
                Toplam <span className="font-semibold text-slate-900">{sources.length}</span> kaynak
              </div>
            </div>

            {/* Table for larger screens */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Kaynak</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Tur</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Bolgeler</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Flep Tipleri</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Anahtar Kelimeler</th>
                    {isUserAdmin && (
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Islemler</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sources.map((source) => {
                    const meta = getSourceMeta(source.source_type);
                    const TypeIcon = meta.icon;
                    return (
                      <tr key={source.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-slate-900 truncate">{source.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {source.content.length > 120 ? source.content.substring(0, 120) + '...' : source.content}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${meta.color}`}>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {source.region_focus && source.region_focus.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {source.region_focus.slice(0, 3).map((region, i) => (
                                <span key={i} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700">
                                  {region}
                                </span>
                              ))}
                              {source.region_focus.length > 3 && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-500">
                                  +{source.region_focus.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {source.flap_types && source.flap_types.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {source.flap_types.slice(0, 2).map((type, i) => (
                                <span key={i} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-violet-50 text-violet-700">
                                  {type}
                                </span>
                              ))}
                              {source.flap_types.length > 2 && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-500">
                                  +{source.flap_types.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {source.keywords && source.keywords.length > 0 ? (
                            <p className="text-xs text-slate-500 max-w-[160px] truncate">
                              {source.keywords.slice(0, 4).join(', ')}
                              {source.keywords.length > 4 && '...'}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-400">--</span>
                          )}
                        </td>
                        {isUserAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/knowledge-base/${source.id}/edit`}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                                title="Duzenle"
                              >
                                <IconPencil className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(source.id)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Sil"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card list for smaller screens */}
            <div className="lg:hidden space-y-3">
              {sources.map((source) => {
                const meta = getSourceMeta(source.source_type);
                const TypeIcon = meta.icon;
                return (
                  <div key={source.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md ${meta.color}`}>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 truncate">{source.title}</h3>
                      </div>
                      {isUserAdmin && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Link
                            href={`/knowledge-base/${source.id}/edit`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                          >
                            <IconPencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {source.content.length > 150 ? source.content.substring(0, 150) + '...' : source.content}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {source.region_focus && source.region_focus.length > 0 && source.region_focus.map((region, i) => (
                        <span key={`r-${i}`} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700">
                          {region}
                        </span>
                      ))}
                      {source.flap_types && source.flap_types.length > 0 && source.flap_types.map((type, i) => (
                        <span key={`f-${i}`} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-violet-50 text-violet-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
