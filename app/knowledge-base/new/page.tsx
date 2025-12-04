'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
// Admin check will be done via API
import type { MedicalSourceInput } from '@/types/medical';

const SOURCE_TYPES: Array<{ value: MedicalSourceInput['source_type']; label: string; icon: string }> = [
  { value: 'text', label: 'Metin', icon: '📝' },
  { value: 'article', label: 'Makale', icon: '📄' },
  { value: 'book', label: 'Kitap', icon: '📚' },
  { value: 'guideline', label: 'Kılavuz', icon: '📋' },
  { value: 'research', label: 'Araştırma', icon: '🔬' },
  { value: 'pdf', label: 'PDF', icon: '📑' },
];

const COMMON_REGIONS = [
  'Alın', 'Burun', 'Burun kanadı', 'Göz kapağı', 'Yanak', 'Dudak', 'Çene', 'Şakak', 'Kulak', 'Boyun'
];

const COMMON_FLAP_TYPES = [
  'Transpozisyon', 'Rotasyon', 'Bilobed', 'Trilobed', 'Advancement', 'V-Y', 'Z-plasti', 'Rhomboid', 'Karol', 'İsland'
];

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
            alert('Bu sayfaya erişim için yönetici yetkisi gereklidir.');
            router.push('/knowledge-base');
            return;
          }
        } else {
          alert('Yönetici kontrolü yapılamadı.');
          router.push('/knowledge-base');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        alert('Yönetici kontrolü yapılamadı.');
        router.push('/knowledge-base');
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, user_id: user.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Lütfen başlık ve içerik alanlarını doldurun');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }
      
      // Verify admin status
      const adminCheck = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
      if (!adminCheck.ok) {
        throw new Error('Yönetici kontrolü yapılamadı');
      }
      const adminData = await adminCheck.json();
      if (!adminData.isAdmin) {
        throw new Error('Bu işlem için yönetici yetkisi gereklidir');
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

      alert('Kaynak başarıyla eklendi!');
      router.push('/knowledge-base');
    } catch (error: any) {
      console.error('Error creating source:', error);
      alert(`Hata: ${error.message}`);
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">➕ Yeni Tıbbi Kaynak Ekle</h1>

        <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-xl p-8 border border-white/20 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaynak Türü *
            </label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData(prev => ({ ...prev, source_type: e.target.value as MedicalSourceInput['source_type'] }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Transpozisyon Flebi Teknikleri"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik * (Tıbbi bilgi, teknik açıklama, vb.)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tıbbi kaynak içeriğini buraya yapıştırın veya yazın..."
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Bu içerik AI tarafından flep önerilerini desteklemek için kullanılacaktır.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaynak URL (Opsiyonel)
            </label>
            <input
              type="url"
              value={formData.source_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İlgili Bölgeler
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.region_focus?.includes(region)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İlgili Flep Tipleri
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_FLAP_TYPES.map((flapType) => (
                <button
                  key={flapType}
                  type="button"
                  onClick={() => toggleFlapType(flapType)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.flap_types?.includes(flapType)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {flapType}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anahtar Kelimeler
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Anahtar kelime ekle ve Enter'a bas"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords?.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
            </button>
            <Link
              href="/knowledge-base"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

