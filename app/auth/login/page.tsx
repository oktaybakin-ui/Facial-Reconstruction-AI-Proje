'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormApple } from '@/components/ui/AuthFormApple';
import { useI18n } from '@/lib/i18n/context';

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
    <>
      {/* Back to Home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-10 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span>{t('nav.home')}</span>
      </Link>

      <AuthFormApple
        title={t('nav.login')}
        subtitle={t('auth.login.subtitle')}
      >
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('auth.login.email')}
            type="email"
            placeholder="ornek@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label={t('auth.login.password')}
            type="password"
            placeholder={t('auth.login.passwordPlaceholder')}
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
            {t('auth.login.noAccount')}{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </AuthFormApple>
    </>
  );
}
