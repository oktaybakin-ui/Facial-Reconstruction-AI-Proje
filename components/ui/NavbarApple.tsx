'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/lib/i18n/context';

export function NavbarApple() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const { t } = useI18n();

  if (isAuthPage) return null;

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[linear-gradient(135deg,#4F8AF7_0%,#3B82F6_100%)] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.25)] group-hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-base font-bold">AI</span>
            </div>
            <span className="text-xl font-bold text-black/95 tracking-tight">{t('app.name')}</span>
          </Link>
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/auth/login">
              <Button variant="tertiary" size="md">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="md">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

