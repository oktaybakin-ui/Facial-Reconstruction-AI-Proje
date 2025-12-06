'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Specialty } from '@/types/cases';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthFormApple } from '@/components/ui/AuthFormApple';
import { useI18n } from '@/lib/i18n/context';

const specialties: Specialty[] = ['Plastik Cerrahi', 'KBB', 'Dermatoloji', 'CMF', 'Diğer'];

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

      window.alert('Registration successful! Your account is pending verification. Redirecting to login...');
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
        className="fixed top-6 left-6 flex items-center gap-2 text-sm text-black/50 hover:text-black/70 z-10 transition-colors"
      >
        <span>←</span>
        <span>Home</span>
      </Link>

      <AuthFormApple
        title={t('nav.register')}
        subtitle="Join our medical AI platform for healthcare professionals"
        className="max-w-2xl"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="TC Identity Number *"
                  type="text"
                  maxLength={11}
                  value={formData.tc_kimlik_no}
                  onChange={(e) => setFormData({ ...formData, tc_kimlik_no: e.target.value })}
                  required
                  disabled={loading}
                />

                <Input
                  label="Email *"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />

                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-black/70">
                    Specialty *
                  </label>
                  <select
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value as Specialty })}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-black/90 hover:border-black/20 transition-all duration-200"
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Password *"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />

                <Input
                  label="Full Name *"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={loading}
                />

                <Input
                  label="Phone Number *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                />

                <Input
                  label="Institution Name (Optional)"
                  type="text"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  disabled={loading}
                />

                <Input
                  label="Institution Email (Optional)"
                  type="email"
                  value={formData.institution_email}
                  onChange={(e) => setFormData({ ...formData, institution_email: e.target.value })}
                  disabled={loading}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-6 border-t border-black/5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.kvkk_consent}
                    onChange={(e) => setFormData({ ...formData, kvkk_consent: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                  />
                  <span className="text-sm text-black/70">
                    I have read and agree to the KVKK and Privacy Policy. *
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.health_professional_declaration}
                    onChange={(e) => setFormData({ ...formData, health_professional_declaration: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    disabled={loading}
                  />
                  <span className="text-sm text-black/70">
                    I declare that I am a healthcare professional. *
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Registering...' : t('nav.register')}
              </Button>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-black/50">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    {t('nav.login')}
                  </Link>
                </p>
              </div>
            </form>
      </AuthFormApple>
    </>
  );
}
