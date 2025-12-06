'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import type { Sex, DepthCategory } from '@/types/cases';

const regions = [
  'Alın',
  'Göz kapağı',
  'Burun kanadı',
  'Burun sırtı',
  'Yanak',
  'Üst dudak',
  'Alt dudak',
  'Çene',
  'Kulak',
  'Diğer',
];

const criticalStructuresOptions = [
  'Alar rim',
  'Eyelid margin',
  'Lip commissure',
  'Nostril',
  'Nasal tip',
  'Columella',
  'Philtrum',
  'Diğer',
];

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    case_code: '',
    age: '',
    sex: '' as Sex | '',
    region: '',
    width_mm: '',
    height_mm: '',
    depth: '' as DepthCategory | '',
    previous_surgery: false,
    previous_radiotherapy: false,
    pathology_suspected: '',
    critical_structures: [] as string[],
    high_aesthetic_zone: false,
    case_date: '', // Vaka tarihi (YYYY-MM-DD)
    case_time: '', // Vaka saati (HH:MM)
    case_duration_minutes: '', // Vaka süresi (dakika)
    patient_special_condition: '', // Hastanın özel durumu
    operation_date: '', // Operasyon tarihi
    followup_days: '21', // Kontrol süresi (varsayılan 21 gün)
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setUploadingPhoto(true);
    setError(null);

    try {
      // Just show preview, actual upload will happen after case creation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setUploadingPhoto(false);
    } catch (err: any) {
      setError(err.message || 'Fotoğraf okuma hatası');
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açmanız gerekli');

      // First create the case
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          width_mm: formData.width_mm ? parseFloat(formData.width_mm) : undefined,
          height_mm: formData.height_mm ? parseFloat(formData.height_mm) : undefined,
          sex: formData.sex || undefined,
          depth: formData.depth || undefined,
          case_date: formData.case_date || undefined,
          case_time: formData.case_time || undefined,
          case_duration_minutes: formData.case_duration_minutes ? parseInt(formData.case_duration_minutes) : undefined,
          patient_special_condition: formData.patient_special_condition || undefined,
          operation_date: formData.operation_date || undefined,
          followup_days: formData.followup_days ? parseInt(formData.followup_days) : undefined,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        
        if (response.status === 401 || response.status === 403) {
          alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          router.push('/auth/login');
          return;
        }
        
        throw new Error(data.error || 'Olgu oluşturulamadı');
      }

      console.log('Case created successfully:', data.case.id);
      const caseId = data.case.id;

      // Upload photo after case creation if file was selected
      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `preop-${caseId}-${timestamp}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log('Uploading pre-op photo after case creation:', filePath);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('case-photos')
            .upload(filePath, photoFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            setError('Fotoğraf yüklenemedi: ' + uploadError.message);
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('case-photos')
              .getPublicUrl(uploadData.path);

            console.log('Photo uploaded, URL:', urlData.publicUrl);

            // Insert photo record
            const { error: photoInsertError } = await supabase
              .from('case_photos')
              .insert({
                case_id: caseId,
                type: 'preop',
                url: urlData.publicUrl,
              });

            if (photoInsertError) {
              console.error('Photo insert error:', photoInsertError);
              setError('Fotoğraf kaydı oluşturulamadı: ' + photoInsertError.message);
            } else {
              console.log('Photo record created successfully');
            }
          }
        } catch (photoErr: any) {
          console.error('Error uploading photo:', photoErr);
          setError('Fotoğraf yükleme hatası: ' + photoErr.message);
        }
      }

      // Wait a moment before redirect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use window.location for hard redirect
      window.location.href = `/cases/${caseId}`;
    } catch (err: any) {
      console.error('Error creating case:', err);
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  };

  const toggleCriticalStructure = (structure: string) => {
    setFormData((prev) => ({
      ...prev,
      critical_structures: prev.critical_structures.includes(structure)
        ? prev.critical_structures.filter((s) => s !== structure)
        : [...prev.critical_structures, structure],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="glass shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/dashboard" className="text-2xl font-bold gradient-text">
              AI Yüz Rekonstrüksiyon Platformu
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
          <div className="mb-8">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
              <span className="text-2xl">➕</span>
            </div>
            <h1 className="text-4xl font-extrabold gradient-text mb-2">Yeni Olgu Ekle</h1>
            <p className="text-gray-600">Hasta bilgilerini ve defekt detaylarını girin</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Olgu Kodu / Protokol No *
                </label>
                <input
                  type="text"
                  required
                  value={formData.case_code}
                  onChange={(e) => setFormData({ ...formData, case_code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cinsiyet
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/10 rounded-xl text-black/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="M">Erkek</option>
                  <option value="F">Kadın</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lezyon Bölgesi *
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/10 rounded-xl text-black/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <option value="">Seçiniz</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Defekt Boyutu (mm) – En
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.width_mm}
                  onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Defekt Boyutu (mm) – Boy
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.height_mm}
                  onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Derinlik
              </label>
              <select
                value={formData.depth}
                onChange={(e) => setFormData({ ...formData, depth: e.target.value as DepthCategory })}
                className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/10 rounded-xl text-black/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="">Seçiniz</option>
                <option value="skin">Cilt</option>
                <option value="skin+subcutis">Cilt+Subkutan</option>
                <option value="muscle">Kas</option>
                <option value="mucosa">Mukozaya Uzanan</option>
              </select>
            </div>

            {/* History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.previous_surgery}
                  onChange={(e) => setFormData({ ...formData, previous_surgery: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Önceki Cerrahi Var mı?</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.previous_radiotherapy}
                  onChange={(e) => setFormData({ ...formData, previous_radiotherapy: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Önceki Radyoterapi Var mı?</span>
              </label>
            </div>

            {/* Pathology */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahmini Patoloji
              </label>
              <input
                type="text"
                value={formData.pathology_suspected}
                onChange={(e) => setFormData({ ...formData, pathology_suspected: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Critical Structures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kritik Yapılar
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {criticalStructuresOptions.map((structure) => (
                  <label key={structure} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.critical_structures.includes(structure)}
                      onChange={() => toggleCriticalStructure(structure)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{structure}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Aesthetic Zone */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.high_aesthetic_zone}
                onChange={(e) => setFormData({ ...formData, high_aesthetic_zone: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Yüksek Estetik Zon</span>
            </label>

            {/* Vaka Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaka Tarihi
                </label>
                <input
                  type="date"
                  value={formData.case_date}
                  onChange={(e) => setFormData({ ...formData, case_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaka Saati
                </label>
                <input
                  type="time"
                  value={formData.case_time}
                  onChange={(e) => setFormData({ ...formData, case_time: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaka Süresi (dakika)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.case_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, case_duration_minutes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Örn: 120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operasyon Tarihi
                </label>
                <input
                  type="date"
                  value={formData.operation_date}
                  onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontrol Süresi (operasyondan kaç gün sonra)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.followup_days}
                  onChange={(e) => setFormData({ ...formData, followup_days: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Varsayılan: 21 gün"
                />
                <p className="mt-1 text-xs text-gray-500">Kontrol tarihi otomatik hesaplanacak</p>
              </div>
            </div>

            {/* Hasta Özel Durumu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hastanın Özel Durumu/Özelliği
              </label>
              <textarea
                value={formData.patient_special_condition}
                onChange={(e) => setFormData({ ...formData, patient_special_condition: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Örn: Diyabet, hipertansiyon, alerji, önceki cerrahi, vb."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pre-op Fotoğraf Yükle
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              {uploadingPhoto && <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>}
              {photoUrl && (
                <div className="mt-4">
                  <img src={photoUrl} alt="Pre-op" className="max-w-xs rounded-md shadow-md" />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet →'}
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-3 glass border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

