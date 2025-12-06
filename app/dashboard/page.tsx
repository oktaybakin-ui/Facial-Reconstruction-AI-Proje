'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import DashboardContent from './DashboardContent';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
        setError('Profil bulunamadı. Lütfen tekrar kayıt olun.');
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
        setError(profileData.ban_reason || 'Hesabınız yasaklanmıştır. Lütfen yönetici ile iletişime geçin.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('Profile found, verified:', profileData.is_verified);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error checking user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Kullanıcı bulunamadı'}
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  if (!profile.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Doğrulama Bekleniyor</h1>
          <p className="text-gray-600 mb-6">
            Hesabınız yönetici onayını bekliyor. Lütfen daha sonra tekrar deneyin.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return <DashboardContent user={user} profile={profile} />;
}

