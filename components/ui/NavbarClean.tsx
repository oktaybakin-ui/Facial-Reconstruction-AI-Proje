'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './Button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/lib/i18n/context';
import { supabase } from '@/lib/supabaseClient';
import { isAdmin } from '@/lib/auth/admin';

export function NavbarClean() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith('/auth');
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const adminStatus = isAdmin(session.user.email || '');
        setIsAdminUser(adminStatus);
        console.log('Auth state changed - User:', session.user.email, 'Is Admin:', adminStatus);
      } else {
        setUser(null);
        setIsAdminUser(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        const adminStatus = isAdmin(currentUser.email || '');
        setIsAdminUser(adminStatus);
        console.log('User check - Email:', currentUser.email, 'Is Admin:', adminStatus);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdminUser(false);
    router.push('/');
    router.refresh();
  };

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Team Logo"
                width={48}
                height={48}
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-black/90 group-hover:text-black transition-colors">
                {t('app.name')}
              </span>
              <span className="text-xs text-black/40 -mt-0.5">FaceTech Fusion</span>
            </div>
          </Link>
          
          {/* Right Side */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <Link href="/knowledge-base">
                  <Button variant="ghost" size="md" className="font-medium">
                    📚 Bilgi Tabanı
                  </Button>
                </Link>
                <Link href="/cases/new">
                  <Button variant="secondary" size="md" className="font-medium">
                    ➕ Yeni Olgu
                  </Button>
                </Link>
                {isAdminUser && (
                  <Link href="/admin">
                    <Button variant="secondary" size="md" className="font-medium">
                      ⚙️ Yönetici
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="md" onClick={handleSignOut} className="font-medium">
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="md" className="font-medium">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="md" className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
