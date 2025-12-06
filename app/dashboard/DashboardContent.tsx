'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Case } from '@/types/cases';
import { isFollowupDue, shouldCheckPathology, getFollowupDaysRemaining, getDaysSinceOperation } from '@/lib/utils/followup';
import { isAdmin } from '@/lib/auth/admin';
import { Button } from '@/components/ui/Button';
import { DashboardMetricCardApple } from '@/components/ui/DashboardMetricCardApple';
import { TableApple } from '@/components/ui/TableApple';
import { PageContainer } from '@/components/ui/PageContainer';
import { useI18n } from '@/lib/i18n/context';
import Image from 'next/image';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface DashboardContentProps {
  user: { id: string; email?: string | null };
  profile: { full_name: string };
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { confirm } = useConfirmDialog();
  const { success, error: showError } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState({ isAdmin: false, loading: true });
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    operated: 0,
    followup: 0,
  });

  useEffect(() => {
    loadCases();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    if (user.email) {
      setAdminStatus({ isAdmin: isAdmin(user.email), loading: false });
    } else {
      setAdminStatus({ isAdmin: false, loading: false });
    }
  };

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);

      setStats({
        total: data?.length || 0,
        planned: data?.filter(c => c.status === 'planned').length || 0,
        operated: data?.filter(c => c.status === 'operated').length || 0,
        followup: data?.filter(c => c.status === 'postop_follow').length || 0,
      });
    } catch (err) {
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDeleteCase = async (caseId: string, caseCode: string) => {
    confirm({
      title: 'Olgu Sil',
      message: `"${caseCode}" olgusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            showError('Oturum açmanız gerekiyor');
            return;
          }

          const response = await fetch(`/api/cases/${caseId}?user_id=${user.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Olgu silinemedi');
          }

          success('Olgu başarıyla silindi');
          loadCases(); // Refresh the list
        } catch (err: any) {
          console.error('Error deleting case:', err);
          showError(err.message || 'Olgu silinirken bir hata oluştu');
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-blue-50 text-blue-700 border border-blue-100',
      operated: 'bg-green-50 text-green-700 border border-green-100',
      postop_follow: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
      completed: 'bg-black/5 text-black/70 border border-black/10',
    };
    const texts = {
      planned: 'Planlı',
      operated: 'Opere',
      postop_follow: 'Takip',
      completed: 'Tamamlandı',
    };
    return {
      style: styles[status as keyof typeof styles] || styles.completed,
      text: texts[status as keyof typeof texts] || status,
    };
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-black/90 tracking-tight">Dashboard</h1>
              <p className="text-base text-black/50 mt-1">Olgularınızı yönetin ve takip edin</p>
            </div>
            <div className="flex items-center gap-3">
              {adminStatus.isAdmin && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    ⚙️ Yönetici
                  </Button>
                </Link>
              )}
              <Link href="/knowledge-base">
                <Button variant="secondary" size="sm">
                  📚 Bilgi Tabanı
                </Button>
              </Link>
              <Link href="/cases/new">
                <Button size="sm">
                  ➕ Yeni Olgu
                </Button>
              </Link>
              <Button variant="tertiary" size="sm" onClick={handleSignOut}>
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <DashboardMetricCardApple
            icon="📋"
            value={stats.total}
            label="Toplam Olgu"
            color="blue"
          />
          <DashboardMetricCardApple
            icon="📅"
            value={stats.planned}
            label="Planlı"
            color="purple"
          />
          <DashboardMetricCardApple
            icon="✅"
            value={stats.operated}
            label="Opere"
            color="green"
          />
          <DashboardMetricCardApple
            icon="🔔"
            value={stats.followup}
            label="Takip"
            color="yellow"
          />
        </div>

        {/* Cases Table */}
        <TableApple>
          <div className="px-6 py-4 border-b border-black/5 bg-black/2">
            <h2 className="text-lg font-semibold text-black/90 tracking-tight">Olgular</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-black/50">Yükleniyor...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-semibold mb-2 text-black/90 tracking-tight">Henüz olgu yok</p>
              <p className="text-sm text-black/50 mb-6">İlk olgunuzu ekleyerek başlayın</p>
              <Link href="/cases/new">
                <Button>➕ İlk Olgunu Ekle</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-black/5">
                <thead className="bg-black/2">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wider">
                      Olgu Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wider">
                      Bölge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-black/5">
                  {cases.map((caseItem) => {
                    const status = getStatusBadge(caseItem.status);
                    return (
                      <tr key={caseItem.id} className="hover:bg-black/2 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black/90">
                          {caseItem.case_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black/60">
                          {caseItem.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black/60">
                          {new Date(caseItem.created_at).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.style}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-4">
                            <Link
                              href={`/cases/${caseItem.id}`}
                              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                              Görüntüle
                            </Link>
                            <Link
                              href={`/cases/${caseItem.id}/edit`}
                              className="text-black/60 hover:text-black/90 font-semibold transition-colors"
                            >
                              Düzenle
                            </Link>
                            <button
                              onClick={() => handleDeleteCase(caseItem.id, caseItem.case_code)}
                              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TableApple>
      </main>
    </PageContainer>
  );
}
