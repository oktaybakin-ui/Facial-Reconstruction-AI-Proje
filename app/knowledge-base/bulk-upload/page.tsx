'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function BulkUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [user, setUser] = useState<any>(null);
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
            alert('Bu sayfaya erişim için yönetici yetkisi gereklidir.');
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
      alert('Lütfen JSON içeriğini girin');
      return;
    }

    try {
      setLoading(true);
      setResults(null);

      // Parse JSON
      let sources: any[];
      try {
        sources = JSON.parse(jsonText);
      } catch (parseError) {
        alert('JSON formatı geçersiz. Lütfen geçerli bir JSON formatı kullanın.');
        return;
      }

      if (!Array.isArray(sources)) {
        alert('JSON bir array olmalıdır');
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
          errors.push(`Kaynak ${i + 1}: Başlık, içerik ve kaynak türü gereklidir`);
          failedCount++;
          continue;
        }

        // Validate source_type
        const validTypes = ['text', 'pdf', 'article', 'book', 'guideline', 'research'];
        if (!validTypes.includes(source.source_type)) {
          errors.push(`Kaynak ${i + 1}: Geçersiz kaynak türü: ${source.source_type}`);
          failedCount++;
          continue;
        }

        try {
          const response = await fetch('/api/medical-sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              user_email: user.email,
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
        } catch (error: any) {
          errors.push(`Kaynak ${i + 1} (${source.title}): ${error.message}`);
          failedCount++;
        }
      }

      setResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10), // Show first 10 errors
      });

      if (successCount > 0) {
        alert(`${successCount} kaynak başarıyla eklendi!`);
        // Clear JSON text on success
        if (failedCount === 0) {
          setJsonText('');
        }
      }

      if (failedCount > 0) {
        console.error('Some sources failed to upload:', errors);
      }
    } catch (error: any) {
      console.error('Error uploading sources:', error);
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    const template = [
      {
        title: "Örnek Kaynak Başlığı",
        content: "Buraya tıbbi kaynağınızın içeriğini yazın. Detaylı bilgi, teknik açıklamalar, vb.",
        source_type: "article",
        keywords: ["anahtar", "kelime", "liste"],
        region_focus: ["Alın", "Burun"],
        flap_types: ["Transpozisyon"],
        source_url: ""
      }
    ];
    setJsonText(JSON.stringify(template, null, 2));
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert('Lütfen JSON dosyası seçin (.json uzantılı)');
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      if (!Array.isArray(parsed)) {
        alert('JSON dosyası bir array içermelidir');
        return;
      }

      setJsonText(JSON.stringify(parsed, null, 2));
      alert(`✅ ${parsed.length} kaynak yüklendi!`);
    } catch (error: any) {
      alert(`Dosya okuma hatası: ${error.message}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="glass border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🏥 Facial Reconstruction AI
          </Link>
          <Link href="/knowledge-base" className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
            ← Geri
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Toplu Kaynak Yükleme</h1>
        <p className="text-gray-600 mb-8">
          JSON formatında birden fazla tıbbi kaynağı tek seferde yükleyin.
        </p>

        <div className="glass rounded-2xl shadow-xl p-8 border border-white/20 space-y-6">
          {/* Dosya Yükleme Alanı */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                JSON Dosyası Sürükle-Bırak veya Tıkla
              </p>
              <p className="text-sm text-gray-500 mb-4">
                .json uzantılı dosyanızı buraya sürükleyin veya seçmek için tıklayın
              </p>
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📂 Dosya Seç
              </button>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={loadTemplate}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              📋 Şablon Yükle
            </button>
            <button
              onClick={() => {
                const template = [
                  {
                    title: "Örnek Kaynak Başlığı",
                    content: "Buraya tıbbi kaynağınızın içeriğini yazın...",
                    source_type: "article",
                    keywords: ["anahtar", "kelime"],
                    region_focus: ["Alın", "Burun"],
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              💾 Şablon Dosyasını İndir
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON İçeriği *
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder='[\n  {\n    "title": "Kaynak Başlığı",\n    "content": "İçerik...",\n    "source_type": "article",\n    "keywords": ["kelime1", "kelime2"],\n    "region_focus": ["Alın"],\n    "flap_types": ["Transpozisyon"],\n    "source_url": ""\n  }\n]'
            />
            <p className="mt-1 text-sm text-gray-500">
              JSON formatında kaynak dizisi. Her kaynak için title, content ve source_type zorunludur.
            </p>
          </div>

          {results && (
            <div className={`p-4 rounded-lg ${results.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <h3 className="font-semibold mb-2">
                {results.failed > 0 ? '⚠️ Yükleme Sonuçları' : '✅ Yükleme Başarılı'}
              </h3>
              <p className="text-sm">
                ✅ Başarılı: {results.success} | ❌ Başarısız: {results.failed}
              </p>
              {results.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Hatalar:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                    {results.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  {results.errors.length >= 10 && (
                    <p className="text-xs text-gray-500 mt-1">
                      (İlk 10 hata gösteriliyor, daha fazlası konsolda)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleUpload}
              disabled={loading || !jsonText.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? '⏳ Yükleniyor...' : '📦 Kaynakları Yükle'}
            </button>
            <Link
              href="/knowledge-base"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              İptal
            </Link>
          </div>
        </div>

        <div className="mt-8 glass rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📖 Kullanım Talimatları</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>JSON formatında kaynaklarınızı hazırlayın (şablon yükleyebilirsiniz)</li>
            <li>Her kaynak için şu alanlar zorunludur: <code className="bg-gray-100 px-1 rounded">title</code>, <code className="bg-gray-100 px-1 rounded">content</code>, <code className="bg-gray-100 px-1 rounded">source_type</code></li>
            <li><code className="bg-gray-100 px-1 rounded">source_type</code> şunlardan biri olmalıdır: text, pdf, article, book, guideline, research</li>
            <li><code className="bg-gray-100 px-1 rounded">keywords</code>, <code className="bg-gray-100 px-1 rounded">region_focus</code>, <code className="bg-gray-100 px-1 rounded">flap_types</code> array formatında olmalıdır</li>
            <li>JSON içeriğini yukarıdaki textarea'ya yapıştırın</li>
            <li>"Kaynakları Yükle" butonuna tıklayın</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

