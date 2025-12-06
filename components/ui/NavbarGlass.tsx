'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/lib/i18n/context';

export function NavbarGlass() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const { t } = useI18n();

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
      <div className="glass border border-white/30 rounded-3xl px-8 py-4 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] bg-white/10 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(99,102,241,0.4)] group-hover:scale-110 group-hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] transition-all duration-300">
              <span className="text-xl">🏥</span>
            </div>
            <span className="text-xl font-black gradient-text drop-shadow-lg">{t('app.name')}</span>
          </Link>
          
          {/* Right Side - Enhanced */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/auth/login">
              <Button variant="ghost" size="md" className="text-base font-semibold text-white hover:text-white/90">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="md" className="text-base font-bold shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.4)]">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
