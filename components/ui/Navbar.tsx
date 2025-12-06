'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './Button';
import { LanguageSelector } from '@/components/LanguageSelector';

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl">🏥</span>
            </div>
            <span className="text-xl font-bold gradient-text">AI Facial Reconstruction</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="sm">
                Üye Ol
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

