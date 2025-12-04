'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { MedicalSource } from '@/types/medical';
// Admin check will be done via API

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [sources, setSources] = useState<MedicalSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
      if (!response.ok) throw new Error('Kaynaklar alınamadı');
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error: any) {
      console.error('Error fetching sources:', error);
      alert(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Bu kaynağı silmek istediğinize emin misiniz?')) return;

    if (!isUserAdmin) {
      alert('Bu işlem için yönetici yetkisi gereklidir.');
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
      alert('Kaynak başarıyla silindi');
    } catch (error: any) {
      console.error('Error deleting source:', error);
      alert(`Hata: ${error.message}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🏥 Facial Reconstruction AI
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/knowledge-base" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              📚 Bilgi Tabanı
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Tıbbi Bilgi Tabanı</h1>
            <p className="text-gray-600">
              AI'ın analizlerinde kullanacağı tıbbi kaynaklar. Bu kaynaklar flep önerilerini destekler.
              {isUserAdmin ? (
                <span className="block mt-2 text-sm text-green-600 font-medium">✅ Yönetici olarak kaynak ekleyebilirsiniz</span>
              ) : (
                <span className="block mt-2 text-sm text-gray-500">ℹ️ Kaynak ekleme/düzenleme sadece yöneticiler tarafından yapılabilir</span>
              )}
            </p>
          </div>
          {isUserAdmin && (
            <div className="flex gap-4">
              <Link
                href="/knowledge-base/new"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                ➕ Yeni Kaynak Ekle
              </Link>
              <Link
                href="/knowledge-base/bulk-upload"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                📦 Toplu Yükleme
              </Link>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Kaynaklar yükleniyor...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="glass rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz kaynak eklenmemiş</h2>
            <p className="text-gray-600 mb-6">
              Tıbbi kaynaklarınızı ekleyerek AI'ın flep önerilerini daha güvenilir ve kaynak bazlı hale getirin.
            </p>
            {isUserAdmin ? (
              <Link
                href="/knowledge-base/new"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
              >
                İlk Kaynağınızı Ekleyin
              </Link>
            ) : (
              <p className="text-gray-500 text-sm">
                Kaynak eklemek için yönetici yetkisi gereklidir.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source) => (
              <div
                key={source.id}
                className="glass rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {source.source_type === 'article' ? '📄' :
                         source.source_type === 'book' ? '📚' :
                         source.source_type === 'guideline' ? '📋' :
                         source.source_type === 'research' ? '🔬' :
                         source.source_type === 'pdf' ? '📑' : '📝'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {source.source_type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{source.title}</h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {source.region_focus && source.region_focus.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Bölgeler:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.region_focus.map((region, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {source.flap_types && source.flap_types.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Flep Tipleri:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {source.flap_types.map((type, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {source.keywords && source.keywords.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Anahtar Kelimeler:</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {source.keywords.slice(0, 5).join(', ')}
                        {source.keywords.length > 5 && '...'}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {source.content.length > 150 ? source.content.substring(0, 150) + '...' : source.content}
                </p>

                {isUserAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/knowledge-base/${source.id}/edit`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                    >
                      ✏️ Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

