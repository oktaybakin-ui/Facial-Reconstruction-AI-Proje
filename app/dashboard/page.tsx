'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import DashboardContent from './DashboardContent';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; is_verified: boolean; is_banned?: boolean; ban_reason?: string; banned_until?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log('No session, redirecting to login');
        router.push('/auth/login');
        return;
      }

      console.log('Session found, user:', session.user.id);
      setUser(session.user);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        setError('Profil bulunamadi. Lutfen tekrar kayit olun.');
        setLoading(false);
        return;
      }

      // Check if user is banned
      const isBanned = profileData.is_banned ?? false;
      let banActive = isBanned;

      if (isBanned && profileData.banned_until) {
        const banUntilDate = new Date(profileData.banned_until);
        const now = new Date();
        if (now > banUntilDate) {
          // Ban expired, update database
          await supabase
            .from('user_profiles')
            .update({
              is_banned: false,
              ban_reason: null,
              banned_at: null,
              banned_until: null,
              banned_by: null
            })
            .eq('id', session.user.id);
          banActive = false;
        }
      }

      if (banActive) {
        setError(profileData.ban_reason || 'Hesabiniz yasaklanmistir. Lutfen yonetici ile iletisime gecin.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('Profile found, verified:', profileData.is_verified);
      setProfile(profileData);
    } catch (err: unknown) {
      console.error('Error checking user:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-cyan-700 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 mt-4 text-sm font-medium">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Hata</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || 'Kullanici bulunamadi'}
          </p>
          <Link href="/auth/login">
            <Button size="md">
              Giris Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile.is_verified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Dogrulama Bekleniyor</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Hesabiniz yonetici onayini bekliyor. Lutfen daha sonra tekrar deneyin.
          </p>
          <Link href="/">
            <Button variant="secondary" size="md">
              Ana Sayfaya Don
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <DashboardContent user={user} profile={profile} />;
}
