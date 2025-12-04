'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Specialty } from '@/types/cases';

const specialties: Specialty[] = ['Plastik Cerrahi', 'KBB', 'Dermatoloji', 'CMF', 'Diğer'];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tc_kimlik_no: '',
    full_name: '',
    specialty: '' as Specialty | '',
    institution_name: '',
    institution_email: '',
    phone: '',
    kvkk_consent: false,
    health_professional_declaration: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt başarısız');
      }

      alert('Kayıt başarılı! Hesabınız doğrulama bekliyor. Giriş sayfasına yönlendiriliyorsunuz...');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative max-w-2xl w-full glass rounded-2xl shadow-2xl p-10 border border-white/20 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Üye Ol</h1>
          <p className="text-gray-600">
            Sağlık profesyonelleri için AI destekli yüz rekonstrüksiyon platformu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TC Kimlik Numarası *
              </label>
              <input
                type="text"
                required
                maxLength={11}
                value={formData.tc_kimlik_no}
                onChange={(e) => setFormData({ ...formData, tc_kimlik_no: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branş *
              </label>
              <select
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value as Specialty })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Seçiniz</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalıştığı Kurum *
              </label>
              <input
                type="text"
                required
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurumsal E-posta *
              </label>
              <input
                type="email"
                required
                value={formData.institution_email}
                onChange={(e) => setFormData({ ...formData, institution_email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kurum Kimlik Kartı (Opsiyonel)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                required
                checked={formData.kvkk_consent}
                onChange={(e) => setFormData({ ...formData, kvkk_consent: e.target.checked })}
                className="mt-1 mr-2"
              />
              <span className="text-sm text-gray-700">
                KVKK ve GDPR kapsamında kişisel verilerimin işlenmesini onaylıyorum. *
              </span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                required
                checked={formData.health_professional_declaration}
                onChange={(e) => setFormData({ ...formData, health_professional_declaration: e.target.checked })}
                className="mt-1 mr-2"
              />
              <span className="text-sm text-gray-700">
                Sağlık profesyoneli olduğumu beyan ederim. *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {loading ? 'Kaydediliyor...' : 'Üye Ol →'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

