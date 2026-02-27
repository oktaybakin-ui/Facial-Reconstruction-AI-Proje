'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Case, CreateCaseInput } from '@/types/cases';

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [formData, setFormData] = useState<CreateCaseInput>({
    case_code: '',
    age: undefined,
    sex: undefined,
    region: '',
    width_mm: undefined,
    height_mm: undefined,
    depth: undefined,
    previous_surgery: false,
    previous_radiotherapy: false,
    pathology_suspected: '',
    critical_structures: [],
    high_aesthetic_zone: false,
    case_date: undefined,
    case_time: undefined,
    case_duration_minutes: undefined,
    patient_special_condition: undefined,
    operation_date: undefined,
    followup_days: 21,
    pathology_result_available: false,
    pathology_result_date: undefined,
    pathology_result: undefined,
  });
  const [criticalStructureInput, setCriticalStructureInput] = useState('');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        throw new Error('Olgu bulunamadı');
      }

      const data = await response.json();
      const caseItem = data.case;

      // Verify ownership
      if (caseItem.user_id !== user.id) {
        alert('Bu olguya erişim yetkiniz yok');
        router.push('/dashboard');
        return;
      }

      setCaseData(caseItem);
      setFormData({
        case_code: caseItem.case_code || '',
        age: caseItem.age || undefined,
        sex: caseItem.sex || undefined,
        region: caseItem.region || '',
        width_mm: caseItem.width_mm || undefined,
        height_mm: caseItem.height_mm || undefined,
        depth: caseItem.depth || undefined,
        previous_surgery: caseItem.previous_surgery || false,
        previous_radiotherapy: caseItem.previous_radiotherapy || false,
        pathology_suspected: caseItem.pathology_suspected || '',
        critical_structures: caseItem.critical_structures || [],
        high_aesthetic_zone: caseItem.high_aesthetic_zone || false,
        case_date: caseItem.case_date || '',
        case_time: caseItem.case_time || '',
        case_duration_minutes: caseItem.case_duration_minutes || undefined,
        patient_special_condition: caseItem.patient_special_condition || '',
        operation_date: caseItem.operation_date || '',
        followup_days: caseItem.followup_days || 21,
        pathology_result_available: caseItem.pathology_result_available || false,
        pathology_result_date: caseItem.pathology_result_date || '',
        pathology_result: caseItem.pathology_result || '',
      });
    } catch (error: unknown) {
      console.error('Error loading case:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.case_code || !formData.region) {
      alert('Lütfen olgu kodu ve bölge alanlarını doldurun');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Olgu güncellenemedi');
      }

      alert('Olgu başarıyla güncellendi!');
      router.push(`/cases/${caseId}`);
    } catch (error: unknown) {
      console.error('Error updating case:', error);
      alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const addCriticalStructure = () => {
    if (criticalStructureInput.trim() && !formData.critical_structures?.includes(criticalStructureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        critical_structures: [...(prev.critical_structures || []), criticalStructureInput.trim()],
      }));
      setCriticalStructureInput('');
    }
  };

  const removeCriticalStructure = (item: string) => {
    setFormData(prev => ({
      ...prev,
      critical_structures: prev.critical_structures?.filter(s => s !== item) || [],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="glass border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🏥 Facial Reconstruction AI
          </Link>
          <Link href={`/cases/${caseId}`} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
            ← Geri
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">✏️ Olgu Düzenle</h1>

        <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-xl p-8 border border-white/20 space-y-6">
          {/* Case Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Olgu Kodu *
            </label>
            <input
              type="text"
              value={formData.case_code}
              onChange={(e) => setFormData(prev => ({ ...prev, case_code: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bölge *
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn: Alın, Burun, Yanak..."
              required
            />
          </div>

          {/* Age and Sex */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yaş
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cinsiyet
              </label>
              <select
                value={formData.sex || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value as 'M' | 'F' | 'Other' | undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="M">Erkek</option>
                <option value="F">Kadın</option>
                <option value="Other">Diğer</option>
              </select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genişlik (mm)
              </label>
              <input
                type="number"
                value={formData.width_mm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, width_mm: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yükseklik (mm)
              </label>
              <input
                type="number"
                value={formData.height_mm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, height_mm: e.target.value ? parseFloat(e.target.value) : undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Derinlik
              </label>
              <select
                value={formData.depth || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, depth: e.target.value as 'skin' | 'skin+subcutis' | 'muscle' | 'mucosa' | undefined }))}
                className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/10 rounded-xl text-black/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="">Seçiniz</option>
                <option value="skin">Sadece deri</option>
                <option value="skin+subcutis">Deri + subkutis</option>
                <option value="muscle">Kas tutulumu</option>
                <option value="mucosa">Mukoza tutulumu</option>
              </select>
            </div>
          </div>

          {/* Critical Structures */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kritik Yapılar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={criticalStructureInput}
                onChange={(e) => setCriticalStructureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCriticalStructure();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Alar rim, Eyelid margin..."
              />
              <button
                type="button"
                onClick={addCriticalStructure}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.critical_structures?.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm flex items-center gap-2"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeCriticalStructure(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Other Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şüpheli Patoloji
              </label>
              <input
                type="text"
                value={formData.pathology_suspected || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pathology_suspected: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.high_aesthetic_zone || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, high_aesthetic_zone: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Yüksek estetik zon</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.previous_surgery || false}
                onChange={(e) => setFormData(prev => ({ ...prev, previous_surgery: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Önceki cerrahi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.previous_radiotherapy || false}
                onChange={(e) => setFormData(prev => ({ ...prev, previous_radiotherapy: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Önceki radyoterapi</span>
            </label>
          </div>

          {/* Vaka Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaka Tarihi
              </label>
              <input
                type="date"
                value={formData.case_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, case_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaka Saati
              </label>
              <input
                type="time"
                value={formData.case_time || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, case_time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaka Süresi (dakika)
              </label>
              <input
                type="number"
                min="0"
                value={formData.case_duration_minutes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, case_duration_minutes: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: 120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta Özel Durumu
              </label>
              <input
                type="text"
                value={formData.patient_special_condition || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_special_condition: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Diyabet, hipertansiyon, alerji"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operasyon Tarihi
              </label>
              <input
                type="date"
                value={formData.operation_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, operation_date: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kontrol Süresi (operasyondan kaç gün sonra)
              </label>
              <input
                type="number"
                min="1"
                value={formData.followup_days || 21}
                onChange={(e) => setFormData(prev => ({ ...prev, followup_days: e.target.value ? parseInt(e.target.value) : 21 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Patoloji Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.pathology_result_available || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, pathology_result_available: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Patoloji Sonucu Çıktı mı?</span>
              </label>
            </div>

            {formData.pathology_result_available && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patoloji Sonuç Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.pathology_result_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pathology_result_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patoloji Sonucu
                  </label>
                  <textarea
                    value={formData.pathology_result || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pathology_result: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Patoloji sonucu detayları..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {saving ? '💾 Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
            </button>
            <Link
              href={`/cases/${caseId}`}
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

