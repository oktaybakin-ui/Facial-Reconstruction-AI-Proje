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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Check admin status via API (more reliable in production)
        try {
          const response = await fetch(`/api/admin/check?email=${encodeURIComponent(session.user.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            setIsAdminUser(data.isAdmin || false);
            console.log('Auth state changed - User:', session.user.email, 'Is Admin:', data.isAdmin);
          } else {
            // Fallback to client-side check
            const adminStatus = isAdmin(session.user.email || '');
            setIsAdminUser(adminStatus);
            console.log('Auth state changed (fallback) - User:', session.user.email, 'Is Admin:', adminStatus);
          }
        } catch (apiError) {
          // Fallback to client-side check if API fails
          const adminStatus = isAdmin(session.user.email || '');
          setIsAdminUser(adminStatus);
          console.log('Auth state changed (fallback) - User:', session.user.email, 'Is Admin:', adminStatus);
        }
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
        
        // Check admin status via API (more reliable in production)
        try {
          const response = await fetch(`/api/admin/check?email=${encodeURIComponent(currentUser.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            setIsAdminUser(data.isAdmin || false);
            console.log('User check - Email:', currentUser.email, 'Is Admin:', data.isAdmin);
          } else {
            // Fallback to client-side check
            const adminStatus = isAdmin(currentUser.email || '');
            setIsAdminUser(adminStatus);
            console.log('User check (fallback) - Email:', currentUser.email, 'Is Admin:', adminStatus);
          }
        } catch (apiError) {
          // Fallback to client-side check if API fails
          const adminStatus = isAdmin(currentUser.email || '');
          setIsAdminUser(adminStatus);
          console.log('User check (fallback) - Email:', currentUser.email, 'Is Admin:', adminStatus);
        }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
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
              <span className="text-base sm:text-lg font-bold text-black/90 group-hover:text-black transition-colors">
                {t('app.name')}
              </span>
              <span className="text-[10px] sm:text-xs text-black/40 -mt-0.5 hidden sm:block">FaceTech Fusion</span>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <Link href="/knowledge-base">
                  <Button variant="ghost" size="md" className="font-medium text-sm">
                    📚 {t('nav.knowledgeBase')}
                  </Button>
                </Link>
                <Link href="/cases/new">
                  <Button variant="secondary" size="md" className="font-medium text-sm">
                    ➕ {t('nav.newCase')}
                  </Button>
                </Link>
                {isAdminUser && (
                  <Link href="/admin">
                    <Button variant="secondary" size="md" className="font-medium text-sm">
                      ⚙️ {t('nav.adminPanel')}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="md" onClick={handleSignOut} className="font-medium text-sm">
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="md" className="font-medium text-sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="md" className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 text-sm">
                    {t('nav.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-black/70 hover:bg-black/5 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <>
                  <Link href="/knowledge-base" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="md" className="w-full justify-start font-medium">
                      📚 {t('nav.knowledgeBase')}
                    </Button>
                  </Link>
                  <Link href="/cases/new" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full justify-start font-medium">
                      ➕ {t('nav.newCase')}
                    </Button>
                  </Link>
                  {isAdminUser && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="md" className="w-full justify-start font-medium">
                        ⚙️ {t('nav.adminPanel')}
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="md" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full justify-start font-medium">
                    {t('nav.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="md" className="w-full justify-start font-medium">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="md" className="w-full justify-start font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
