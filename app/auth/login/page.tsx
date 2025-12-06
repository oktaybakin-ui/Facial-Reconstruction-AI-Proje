'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormApple } from '@/components/ui/AuthFormApple';
import { useI18n } from '@/lib/i18n/context';

export default function LoginPage() {
  const router = useRouter();
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
        className="fixed top-6 left-6 flex items-center gap-2 text-sm text-black/50 hover:text-black/70 z-10 transition-colors"
      >
        <span>←</span>
        <span>Home</span>
      </Link>

      <AuthFormApple
        title={t('nav.login')}
        subtitle="Access your medical AI platform"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-xl text-red-700">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : t('nav.login')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-black/50">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </AuthFormApple>
    </>
  );
}
