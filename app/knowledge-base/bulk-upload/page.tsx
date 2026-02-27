'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

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

function IconArrowLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

function IconCloudUpload({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 4.502 4.502 0 013.516 5.855A4.5 4.5 0 0118 19.5H6.75z" />
    </svg>
  );
}

function IconTemplate({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconDownload({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconCheckCircle({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconExclamationTriangle({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function IconXCircle({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconInfo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function IconCode({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BulkUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [dragging, setDragging] = useState(false);

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

    // Check admin status
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
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/knowledge-base');
      }
    }
  };

  const handleUpload = async () => {
    if (!jsonText.trim()) {
      alert('Lutfen JSON icerigini girin');
      return;
    }

    try {
      setLoading(true);
      setResults(null);

      // Parse JSON
      let sources: Array<Record<string, unknown>>;
      try {
        sources = JSON.parse(jsonText);
      } catch (parseError) {
        alert('JSON formati gecersiz. Lutfen gecerli bir JSON formati kullanin.');
        return;
      }

      if (!Array.isArray(sources)) {
        alert('JSON bir array olmalidir');
        return;
      }

      // Validate and upload sources
      const errors: string[] = [];
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];

        // Validate required fields
        if (!source.title || !source.content || !source.source_type) {
          errors.push(`Kaynak ${i + 1}: Baslik, icerik ve kaynak turu gereklidir`);
          failedCount++;
          continue;
        }

        // Validate source_type
        const validTypes = ['text', 'pdf', 'article', 'book', 'guideline', 'research'];
        if (!validTypes.includes(String(source.source_type))) {
          errors.push(`Kaynak ${i + 1}: Gecersiz kaynak turu: ${source.source_type}`);
          failedCount++;
          continue;
        }

        try {
          const response = await fetch('/api/medical-sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user!.id,
              user_email: user!.email,
              title: source.title,
              content: source.content,
              source_type: source.source_type,
              source_url: source.source_url || '',
              keywords: Array.isArray(source.keywords) ? source.keywords : [],
              region_focus: Array.isArray(source.region_focus) ? source.region_focus : [],
              flap_types: Array.isArray(source.flap_types) ? source.flap_types : [],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            errors.push(`Kaynak ${i + 1} (${source.title}): ${errorData.error || 'Bilinmeyen hata'}`);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error: unknown) {
          errors.push(`Kaynak ${i + 1} (${source.title}): ${error instanceof Error ? error.message : String(error)}`);
          failedCount++;
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10), // Show first 10 errors
      });

      if (successCount > 0) {
        alert(`${successCount} kaynak basariyla eklendi!`);
        // Clear JSON text on success
        if (failedCount === 0) {
          setJsonText('');
        }
      }

      if (failedCount > 0) {
        console.error('Some sources failed to upload:', errors);
      }
    } catch (error: unknown) {
      console.error('Error uploading sources:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    const template = [
      {
        title: "Ornek Kaynak Basligi",
        content: "Buraya tibbi kaynaginizin icerigini yazin. Detayli bilgi, teknik aciklamalar, vb.",
        source_type: "article",
        keywords: ["anahtar", "kelime", "liste"],
        region_focus: ["Alin", "Burun"],
        flap_types: ["Transpozisyon"],
        source_url: ""
      }
    ];
    setJsonText(JSON.stringify(template, null, 2));
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert('Lutfen JSON dosyasi secin (.json uzantili)');
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        alert('JSON dosyasi bir array icermelidir');
        return;
      }

      setJsonText(JSON.stringify(parsed, null, 2));
      alert(`${parsed.length} kaynak yuklendi!`);
    } catch (error: unknown) {
      alert(`Dosya okuma hatasi: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (!isAdmin) return null;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
            <IconHome className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/knowledge-base" className="hover:text-slate-700 transition-colors">Bilgi Tabani</Link>
          <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium">Toplu Yukleme</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700">
            <IconUpload className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Toplu Kaynak Yukleme</h1>
            <p className="text-sm text-slate-500">JSON formatinda birden fazla tibbi kaynagi tek seferde yukleyin.</p>
          </div>
        </div>

        {/* Drag & Drop zone */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragging
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <div className={`flex items-center justify-center h-14 w-14 rounded-2xl mb-4 transition-colors ${
                dragging ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400'
              }`}>
                <IconCloudUpload className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                JSON dosyanizi surukleyin veya secin
              </p>
              <p className="text-xs text-slate-400 mb-4">
                .json uzantili dosyalar desteklenmektedir
              </p>
              <Button type="button" variant="secondary" size="sm">
                Dosya Sec
              </Button>
            </label>
          </div>
        </div>

        {/* Template buttons & JSON editor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">JSON Icerigi</h2>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={loadTemplate}>
                <IconTemplate className="h-4 w-4" />
                Sablon Yukle
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const template = [
                    {
                      title: "Ornek Kaynak Basligi",
                      content: "Buraya tibbi kaynaginizin icerigini yazin...",
                      source_type: "article",
                      keywords: ["anahtar", "kelime"],
                      region_focus: ["Alin", "Burun"],
                      flap_types: ["Transpozisyon"],
                      source_url: ""
                    }
                  ];
                  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'bulk_load_template.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <IconDownload className="h-4 w-4" />
                Sablon Indir
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={18}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 hover:border-slate-300 transition-colors duration-150 font-mono text-sm leading-relaxed"
              placeholder={'[\n  {\n    "title": "Kaynak Basligi",\n    "content": "Icerik...",\n    "source_type": "article",\n    "keywords": ["kelime1", "kelime2"],\n    "region_focus": ["Alin"],\n    "flap_types": ["Transpozisyon"],\n    "source_url": ""\n  }\n]'}
            />
            <p className="text-xs text-slate-500">
              JSON formatinda kaynak dizisi. Her kaynak icin title, content ve source_type zorunludur.
            </p>
          </div>
        </div>

        {/* Results panel */}
        {results && (
          <div className={`rounded-xl border p-5 mb-6 ${
            results.failed > 0
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              {results.failed > 0 ? (
                <IconExclamationTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <IconCheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`text-sm font-semibold mb-1 ${
                  results.failed > 0 ? 'text-amber-800' : 'text-emerald-800'
                }`}>
                  {results.failed > 0 ? 'Yukleme Sonuclari' : 'Yukleme Basarili'}
                </h3>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <IconCheckCircle className="h-4 w-4" />
                    Basarili: {results.success}
                  </span>
                  {results.failed > 0 && (
                    <span className="flex items-center gap-1.5 text-red-600">
                      <IconXCircle className="h-4 w-4" />
                      Basarisiz: {results.failed}
                    </span>
                  )}
                </div>
                {results.errors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-slate-700">Hatalar:</p>
                    <ul className="text-xs text-red-600 space-y-1">
                      {results.errors.map((error, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">--</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                    {results.errors.length >= 10 && (
                      <p className="text-xs text-slate-500 mt-1">
                        (Ilk 10 hata gosteriliyor, daha fazlasi konsolda)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 mb-8">
          <Link href="/knowledge-base">
            <Button type="button" variant="ghost">
              Iptal
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!jsonText.trim()}
            onClick={handleUpload}
          >
            <IconUpload className="h-4 w-4" />
            {loading ? 'Yukleniyor...' : 'Kaynaklari Yukle'}
          </Button>
        </div>

        {/* Instructions card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconInfo className="h-5 w-5 text-cyan-700" />
            <h2 className="text-base font-semibold text-slate-900">Kullanim Talimatlari</h2>
          </div>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">1</span>
              <span>JSON formatinda kaynaklarinizi hazirlayin (sablon yukleyebilirsiniz)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">2</span>
              <span>Her kaynak icin su alanlar zorunludur:
                <span className="inline-flex items-center gap-1 mx-1">
                  <IconCode className="h-3 w-3 text-slate-400" />
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">title</code>
                </span>,
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">content</code>,
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">source_type</code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">3</span>
              <span>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">source_type</code> sunlardan biri olmalidir:
                <span className="text-slate-500"> text, pdf, article, book, guideline, research</span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">4</span>
              <span>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">keywords</code>,
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700 ml-1">region_focus</code>,
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700 ml-1">flap_types</code> array formatinda olmalidir
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">5</span>
              <span>JSON icerigini yukaridaki metin alanina yapistirin</span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">6</span>
              <span>&quot;Kaynaklari Yukle&quot; butonuna tiklayin</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
