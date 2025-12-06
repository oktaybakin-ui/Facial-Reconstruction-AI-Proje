'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { isAdmin } from '@/lib/auth/admin';
import { useToast } from '@/components/Toast';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { logger } from '@/lib/utils/logger';

interface User {
  id: string;
  email: string;
  full_name: string;
  specialty: string;
  is_verified: boolean;
  created_at: string;
  institution_name: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { success, error: showError, warning } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);

  useEffect(() => {
    checkAdminAndLoadUsers();
    loadAutoApproveSetting();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        router.push('/auth/login');
        return;
      }

      // Check admin status via API (more reliable in production)
      try {
        const response = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Admin kontrolü başarısız');
        }
        const data = await response.json();
        
        logger.info('Admin check result:', { email: user.email, isAdmin: data.isAdmin });
        
        if (!data.isAdmin) {
          showError(`Bu sayfaya erişim yetkiniz yok. Email: ${user.email}`);
          logger.warn('Admin access denied:', { email: user.email, response: data });
          router.push('/dashboard');
          return;
        }

        setIsAdminUser(true);
        await loadUsers();
      } catch (apiError: any) {
        // Fallback to client-side check if API fails
        logger.warn('API admin check failed, using fallback:', apiError);
        const fallbackAdminStatus = isAdmin(user.email);
        logger.info('Fallback admin check:', { email: user.email, isAdmin: fallbackAdminStatus });
        
        if (!fallbackAdminStatus) {
          showError(`Bu sayfaya erişim yetkiniz yok. Email: ${user.email}. Lütfen Vercel'de ADMIN_EMAILS environment variable'ını kontrol edin.`);
          router.push('/dashboard');
          return;
        }
        setIsAdminUser(true);
        await loadUsers();
      }
    } catch (error: unknown) {
      logger.error('Error checking admin:', error);
      showError('Bir hata oluştu');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      logger.info('Loading users...');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Failed to load users:', { status: response.status, error: errorData });
        throw new Error(errorData.error || 'Kullanıcılar alınamadı');
      }

      const data = await response.json();
      logger.info('Users loaded:', { count: data.users?.length || 0 });
      setUsers(data.users || []);
      
      if (!data.users || data.users.length === 0) {
        logger.warn('No users found in database');
      }
    } catch (error: unknown) {
      logger.error('Error loading users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcılar yüklenemedi';
      showError(errorMessage);
    }
  };

  const loadAutoApproveSetting = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/auto-approve', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAutoApproveEnabled(data.enabled || false);
      }
    } catch (error: unknown) {
      logger.error('Error loading auto-approve setting:', error);
    }
  };

  const handleApprove = async (userId: string) => {
    return new Promise<void>((resolve) => {
      confirm({
        title: 'Kullanıcı Onayla',
        message: 'Bu kullanıcıyı onaylamak istediğinize emin misiniz?',
        confirmText: 'Onayla',
        cancelText: 'İptal',
        onConfirm: async () => {
          await approveUser(userId);
          resolve();
        },
        onCancel: () => resolve(),
      });
    });
  };

  const approveUser = async (userId: string) => {
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || 'Onaylama başarısız';
        logger.error('Approve user failed:', { status: response.status, error: errorData });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.info('User approved successfully:', { userId, user: data.user });
      success('Kullanıcı onaylandı');
      await loadUsers();
    } catch (error: unknown) {
      logger.error('Error approving user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı onaylanamadı';
      showError(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) {
      warning('Lütfen en az bir kullanıcı seçin');
      return;
    }

    return new Promise<void>((resolve) => {
      confirm({
        title: 'Toplu Onaylama',
        message: `${selectedUsers.length} kullanıcıyı onaylamak istediğinize emin misiniz?`,
        confirmText: 'Onayla',
        cancelText: 'İptal',
        onConfirm: async () => {
          await bulkApproveUsers();
          resolve();
        },
        onCancel: () => resolve(),
      });
    });
  };

  const bulkApproveUsers = async () => {

    setBulkUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const promises = selectedUsers.map(userId =>
        fetch(`/api/admin/users/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
      );

      await Promise.all(promises);
      success(`${selectedUsers.length} kullanıcı onaylandı`);
      setSelectedUsers([]);
      await loadUsers();
    } catch (error: unknown) {
      logger.error('Error bulk approving users:', error);
      showError('Toplu onaylama başarısız');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleToggleAutoApprove = async () => {
    const newValue = !autoApproveEnabled;
    return new Promise<void>((resolve) => {
      confirm({
        title: 'Otomatik Onay Ayarı',
        message: newValue
          ? 'Otomatik onayı etkinleştirmek istediğinize emin misiniz? Yeni kayıt olan tüm kullanıcılar otomatik olarak onaylanacak.'
          : 'Otomatik onayı devre dışı bırakmak istediğinize emin misiniz?',
        confirmText: 'Evet',
        cancelText: 'İptal',
        onConfirm: async () => {
          await toggleAutoApprove(newValue);
          resolve();
        },
        onCancel: () => resolve(),
      });
    });
  };

  const toggleAutoApprove = async (newValue: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/auto-approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Ayar güncellenemedi');
      }

      setAutoApproveEnabled(newValue);
      success(newValue ? 'Otomatik onay etkinleştirildi' : 'Otomatik onay devre dışı bırakıldı');
    } catch (error: unknown) {
      logger.error('Error toggling auto-approve:', error);
      showError('Ayar güncellenemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  const pendingUsers = users.filter(u => !u.is_verified);
  const approvedUsers = users.filter(u => u.is_verified);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Yönetici Paneli</h1>
            <p className="text-gray-600">Kullanıcıları yönetin ve onaylayın</p>
            <p className="text-sm text-gray-500 mt-1">Toplam: {users.length} kullanıcı | Bekleyen: {pendingUsers.length}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Yenile
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
            >
              ← Dashboard'a Dön
            </button>
          </div>
        </div>

        {/* Auto Approve Toggle */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Otomatik Onay</h2>
              <p className="text-sm text-gray-600">
                {autoApproveEnabled
                  ? 'Yeni kayıt olan kullanıcılar otomatik olarak onaylanıyor'
                  : 'Yeni kayıt olan kullanıcılar manuel onay bekliyor'}
              </p>
            </div>
            <button
              onClick={handleToggleAutoApprove}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                autoApproveEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoApproveEnabled ? 'Aktif' : 'Pasif'}
            </button>
          </div>
        </div>

        {/* Pending Users */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Onay Bekleyen Kullanıcılar ({pendingUsers.length})
              </h2>
              {selectedUsers.length > 0 && (
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkUpdating}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {bulkUpdating ? 'Onaylanıyor...' : `Seçilenleri Onayla (${selectedUsers.length})`}
                </button>
              )}
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-semibold">Onay bekleyen kullanıcı yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === pendingUsers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(pendingUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">E-posta</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ad Soyad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branş</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kurum</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kayıt Tarihi</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.specialty}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.institution_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={updating === user.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                        >
                          {updating === user.id ? 'Onaylanıyor...' : 'Onayla'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Users */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              Onaylanmış Kullanıcılar ({approvedUsers.length})
            </h2>
          </div>

          {approvedUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg font-semibold">Onaylanmış kullanıcı yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">E-posta</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ad Soyad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branş</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kurum</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.specialty}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.institution_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

