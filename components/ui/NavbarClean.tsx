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
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const response = await fetch(`/api/admin/check?email=${encodeURIComponent(session.user.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            setIsAdminUser(data.isAdmin || false);
          } else {
            setIsAdminUser(isAdmin(session.user.email || ''));
          }
        } catch {
          setIsAdminUser(isAdmin(session.user.email || ''));
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
        try {
          const response = await fetch(`/api/admin/check?email=${encodeURIComponent(currentUser.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            setIsAdminUser(data.isAdmin || false);
          } else {
            setIsAdminUser(isAdmin(currentUser.email || ''));
          }
        } catch {
          setIsAdminUser(isAdmin(currentUser.email || ''));
        }
      }
    } catch {
      // Auth check failed silently
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
    <nav className="sticky top-0 z-50 glass-navbar border-b border-slate-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="FaceTech Fusion"
                width={36}
                height={36}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                FaceTech Fusion
              </span>
              <span className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block font-medium">
                {t('app.name')}
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <LanguageSelector />

            {loading ? (
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin ml-3" />
            ) : user ? (
              <>
                <Link href="/knowledge-base">
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    {t('nav.knowledgeBase')}
                  </Button>
                </Link>
                <Link href="/cases/new">
                  <Button variant="primary" size="sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {t('nav.newCase')}
                  </Button>
                </Link>
                {isAdminUser && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {t('nav.adminPanel')}
                    </Button>
                  </Link>
                )}
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
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
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white pb-4 pt-2 animate-fadeInUp">
            <div className="space-y-1">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <>
                  <MobileNavLink href="/knowledge-base" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.knowledgeBase')}
                  </MobileNavLink>
                  <MobileNavLink href="/cases/new" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.newCase')}
                  </MobileNavLink>
                  {isAdminUser && (
                    <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.adminPanel')}
                    </MobileNavLink>
                  )}
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MobileNavLink href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signIn')}
                  </MobileNavLink>
                  <div className="px-3 pt-2">
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        {t('nav.getStarted')}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
