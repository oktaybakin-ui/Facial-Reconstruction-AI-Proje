'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/lib/i18n/context';

// Lazy-load the promo section so it doesn't block initial paint
const LoginPromoSection = dynamic(
  () => import('@/components/ui/LoginPromoSection'),
  { ssr: false }
);

export default function LoginPage() {
  const { t } = useI18n();
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      if (!data.user) {
        throw new Error('User not found');
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_verified')
        .eq('id', data.user.id)
        .single();

      const isVerified = profile?.is_verified ?? false;

      if (!isVerified) {
        const continueAnyway = window.confirm('Your account is pending verification. Do you want to continue anyway?');
        if (!continueAnyway) {
          setLoading(false);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Animated Promo Section (hidden on mobile) ── */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
        <LoginPromoSection />
      </div>

      {/* ── Right: Login Form ── */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-slate-50 relative">
        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>{t('nav.home')}</span>
        </Link>

        {/* Centered form container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-14 py-16">
          <div className="w-full max-w-md">
            {/* Brand Mark */}
            <div className="flex justify-center mb-6">
              <div className="w-11 h-11 rounded-lg bg-cyan-700 flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                {t('nav.login')}
              </h1>
              <p className="text-sm text-slate-500">
                AI destekli cerrahi planlama platformuna erişin
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label="Parola"
                type="password"
                placeholder="Parolanizi girin"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {t('nav.login')}
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Hesabiniz yok mu?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </p>
            </div>

            {/* Mobile-only: Mini feature list */}
            <div className="mt-10 pt-8 border-t border-slate-200 lg:hidden">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Platform Özellikleri
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '📸', text: 'Pre-op Analiz' },
                  { icon: '🧠', text: 'AI Flep Planlama' },
                  { icon: '📊', text: 'Risk Skorlama' },
                  { icon: '🔒', text: 'KVKK Uyumlu' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-slate-400">
            FaceTech Fusion &middot; The Head & Neck Engineers
          </p>
        </div>
      </div>
    </div>
  );
}
