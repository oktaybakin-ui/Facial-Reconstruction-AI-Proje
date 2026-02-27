'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MedicalSourceInput } from '@/types/medical';

/* ------------------------------------------------------------------ */
/*  SVG Icon components                                                */
/* ------------------------------------------------------------------ */

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

function IconPlus({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconX({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconArrowLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconSave({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconDocument({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconBook({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SOURCE_TYPES: Array<{ value: MedicalSourceInput['source_type']; label: string; icon: React.FC<{ className?: string }> }> = [
  { value: 'text', label: 'Metin', icon: IconDocumentText },
  { value: 'article', label: 'Makale', icon: IconDocument },
  { value: 'book', label: 'Kitap', icon: IconBook },
  { value: 'guideline', label: 'Kilavuz', icon: IconClipboard },
  { value: 'research', label: 'Arastirma', icon: IconBeaker },
  { value: 'pdf', label: 'PDF', icon: IconDocumentText },
];

const COMMON_REGIONS = [
  'Alin', 'Burun', 'Burun kanadi', 'Goz kapagi', 'Yanak', 'Dudak', 'Cene', 'Sakak', 'Kulak', 'Boyun'
];

const COMMON_FLAP_TYPES = [
  'Transpozisyon', 'Rotasyon', 'Bilobed', 'Trilobed', 'Advancement', 'V-Y', 'Z-plasti', 'Rhomboid', 'Karol', 'Island'
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function NewSourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MedicalSourceInput & { user_id: string }>({
    user_id: '',
    title: '',
    content: '',
    source_type: 'text',
    source_url: '',
    keywords: [],
    region_focus: [],
    flap_types: [],
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin via API
    if (user.email) {
      try {
        const response = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.isAdmin) {
            alert('Bu sayfaya erisim icin yonetici yetkisi gereklidir.');
            router.push('/knowledge-base');
            return;
          }
        } else {
          alert('Yonetici kontrolu yapilamadi.');
          router.push('/knowledge-base');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        alert('Yonetici kontrolu yapilamadi.');
        router.push('/knowledge-base');
        return;
      }
    }

    setFormData(prev => ({ ...prev, user_id: user.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Lutfen baslik ve icerik alanlarini doldurun');
      return;
    }

    try {
      setLoading(true);

      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('Kullanici bilgisi bulunamadi');
      }

      // Verify admin status
      const adminCheck = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
      if (!adminCheck.ok) {
        throw new Error('Yonetici kontrolu yapilamadi');
      }
      const adminData = await adminCheck.json();
      if (!adminData.isAdmin) {
        throw new Error('Bu islem icin yonetici yetkisi gereklidir');
      }

      const response = await fetch('/api/medical-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_email: user.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kaynak eklenemedi');
      }

      alert('Kaynak basariyla eklendi!');
      router.push('/knowledge-base');
    } catch (error: unknown) {
      console.error('Error creating source:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || [],
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      region_focus: prev.region_focus?.includes(region)
        ? prev.region_focus.filter(r => r !== region)
        : [...(prev.region_focus || []), region],
    }));
  };

  const toggleFlapType = (flapType: string) => {
    setFormData(prev => ({
      ...prev,
      flap_types: prev.flap_types?.includes(flapType)
        ? prev.flap_types.filter(f => f !== flapType)
        : [...(prev.flap_types || []), flapType],
    }));
  };

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
            <Link href="/knowledge-base" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              <IconArrowLeft className="h-4 w-4" />
              Geri Don
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <IconHome className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/knowledge-base" className="hover:text-slate-700 transition-colors">Bilgi Tabani</Link>
          <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium">Yeni Kaynak</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700">
            <IconPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yeni Tibbi Kaynak Ekle</h1>
            <p className="text-sm text-slate-500">AI analizlerini destekleyecek yeni bir tibbi kaynak olusturun.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Type & Title card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Temel Bilgiler</h2>

            {/* Source type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Kaynak Turu <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SOURCE_TYPES.map((type) => {
                  const TypeIcon = type.icon;
                  const isSelected = formData.source_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, source_type: type.value }))}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <TypeIcon className="h-5 w-5" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <Input
              label="Baslik"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Orn: Transpozisyon Flebi Teknikleri"
            />

            {/* Content */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Icerik <span className="text-red-500 ml-0.5">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 hover:border-slate-300 transition-colors duration-150 text-sm"
                placeholder="Tibbi kaynak icerigini buraya yapistirin veya yazin..."
              />
              <p className="text-xs text-slate-500">
                Bu icerik AI tarafindan flep onerilerini desteklemek icin kullanilacaktir.
              </p>
            </div>

            {/* Source URL */}
            <Input
              label="Kaynak URL"
              type="url"
              value={formData.source_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
              placeholder="https://..."
              hint="Opsiyonel - Kaynagin orijinal web adresi"
            />
          </div>

          {/* Regions & Flap Types card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Siniflandirma</h2>

            {/* Regions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Ilgili Bolgeler</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_REGIONS.map((region) => {
                  const isSelected = formData.region_focus?.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flap types */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Ilgili Flep Tipleri</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FLAP_TYPES.map((flapType) => {
                  const isSelected = formData.flap_types?.includes(flapType);
                  return (
                    <button
                      key={flapType}
                      type="button"
                      onClick={() => toggleFlapType(flapType)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-violet-300 bg-violet-50 text-violet-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {flapType}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Keywords card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Anahtar Kelimeler</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Anahtar kelime ekle ve Enter'a bas"
                />
              </div>
              <Button type="button" variant="secondary" onClick={addKeyword} className="flex-shrink-0">
                Ekle
              </Button>
            </div>
            {formData.keywords && formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-medium border border-cyan-200"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="text-cyan-400 hover:text-cyan-700 transition-colors"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-8">
            <Link href="/knowledge-base">
              <Button type="button" variant="ghost">
                Iptal
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" loading={loading}>
              <IconSave className="h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
