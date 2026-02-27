'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Specialty } from '@/types/cases';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormApple } from '@/components/ui/AuthFormApple';
import { useI18n } from '@/lib/i18n/context';

const specialties: Specialty[] = ['Plastik Cerrahi', 'KBB', 'Dermatoloji', 'CMF', 'Di\u011fer'];

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
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
        throw new Error(data.error || 'Registration failed');
      }

      window.alert(t('auth.register.success'));
      router.push('/auth/login');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
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
        title={t('nav.register')}
        subtitle={t('auth.register.subtitle')}
        className="max-w-2xl"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              {t('auth.register.personalInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.register.tcKimlik')}
                type="text"
                maxLength={11}
                placeholder={t('auth.register.tcPlaceholder')}
                value={formData.tc_kimlik_no}
                onChange={(e) => setFormData({ ...formData, tc_kimlik_no: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label={t('auth.register.fullName')}
                type="text"
                placeholder={t('auth.register.fullNamePlaceholder')}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label={t('auth.register.email')}
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label={t('auth.register.password')}
                type="password"
                placeholder={t('auth.register.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />

              <Input
                label={t('auth.register.phone')}
                type="tel"
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />

              {/* Specialty Select */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  {t('auth.register.specialty')}<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value as Specialty })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 hover:border-slate-300 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <option value="">{t('auth.register.selectSpecialty')}</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Institution Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              {t('auth.register.institutionInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.register.institutionName')}
                type="text"
                placeholder={t('auth.register.institutionPlaceholder')}
                value={formData.institution_name}
                onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                disabled={loading}
                hint={t('auth.register.optional')}
              />

              <Input
                label={t('auth.register.institutionEmail')}
                type="email"
                placeholder="ad.soyad@kurum.edu.tr"
                value={formData.institution_email}
                onChange={(e) => setFormData({ ...formData, institution_email: e.target.value })}
                disabled={loading}
                hint={t('auth.register.optional')}
              />
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={formData.kvkk_consent}
                onChange={(e) => setFormData({ ...formData, kvkk_consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-2 focus:ring-cyan-600/20"
                disabled={loading}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {t('auth.register.kvkkConsent')} <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={formData.health_professional_declaration}
                onChange={(e) => setFormData({ ...formData, health_professional_declaration: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-2 focus:ring-cyan-600/20"
                disabled={loading}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {t('auth.register.healthProfessional')} <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {t('nav.register')}
            </Button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {t('auth.register.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              {t('nav.login')}
            </Link>
          </p>
        </div>
      </AuthFormApple>
    </>
  );
}
