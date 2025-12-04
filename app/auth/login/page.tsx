'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Giriş başarısız');
      }

      if (!data.user) {
        console.error('No user returned');
        throw new Error('Kullanıcı bulunamadı');
      }

      console.log('Login successful, user:', data.user.id);

      // Check verification status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_verified')
        .eq('id', data.user.id)
        .single();

      const isVerified = profile?.is_verified ?? false;
      console.log('User verified status:', isVerified);

      if (!isVerified) {
        const continueAnyway = confirm('Hesabınız doğrulanmayı bekliyor. Yine de devam etmek istiyor musunuz?');
        if (!continueAnyway) {
          setLoading(false);
          return;
        }
      }

      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success - redirect to dashboard
      console.log('Redirecting to dashboard...');
      
      // Wait a bit for session to be saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use window.location for hard redirect
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Giriş başarısız. E-posta veya şifre hatalı.');
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
      
      <div className="relative max-w-md w-full glass rounded-2xl shadow-2xl p-10 border border-white/20 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Giriş Yap</h1>
          <p className="text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Üye Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

