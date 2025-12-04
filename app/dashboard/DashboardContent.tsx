'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Case } from '@/types/cases';
import { isFollowupDue, shouldCheckPathology, getFollowupDaysRemaining, getDaysSinceOperation } from '@/lib/utils/followup';
import { isAdmin } from '@/lib/auth/admin';

interface DashboardContentProps {
  user: { id: string; email?: string | null };
  profile: { full_name: string };
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter();
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

      // Calculate stats
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'operated':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'postop_follow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planlı';
      case 'operated':
        return 'Opere';
      case 'postop_follow':
        return 'Takip';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              AI Yüz Rekonstrüksiyon Platformu
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Hoş geldiniz, Dr. {profile.full_name}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">Olgularınızı yönetin ve takip edin</p>
          </div>
          <div className="flex gap-3">
            {adminStatus.isAdmin && (
              <Link
                href="/admin"
                className="px-5 py-2.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                ⚙️ Yönetici Paneli
              </Link>
            )}
            <Link
              href="/knowledge-base"
              className="px-5 py-2.5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              📚 Bilgi Tabanı
            </Link>
            <Link
              href="/cases/new"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              ➕ Yeni Olgu Ekle
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:shadow-2xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Toplam Olgu</div>
          </div>
          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-4xl font-extrabold text-indigo-600 mb-2">{stats.planned}</div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Planlı</div>
          </div>
          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:shadow-2xl hover:border-green-400 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-4xl font-extrabold text-green-600 mb-2">{stats.operated}</div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Opere</div>
          </div>
          <div className="group bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:shadow-2xl hover:border-yellow-400 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="text-4xl font-extrabold text-yellow-600 mb-2">{stats.followup}</div>
            <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Takip</div>
          </div>
        </div>

        {/* Hatırlatmalar */}
        {cases.filter(c => {
          const followupDue = isFollowupDue(c.operation_date, c.followup_days || 21);
          const pathologyCheckDue = shouldCheckPathology(c.operation_date) && !c.pathology_result_available;
          return followupDue || pathologyCheckDue;
        }).length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">⚠️</span>
              <h2 className="text-lg font-bold text-orange-900">Hatırlatmalar</h2>
            </div>
            <div className="space-y-2">
              {cases.filter(c => {
                const followupDue = isFollowupDue(c.operation_date, c.followup_days || 21);
                const daysRemaining = getFollowupDaysRemaining(c.operation_date, c.followup_days || 21);
                return followupDue;
              }).map(c => {
                const daysRemaining = getFollowupDaysRemaining(c.operation_date, c.followup_days || 21);
                return (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-orange-800">
                    <span>🔔</span>
                    <Link href={`/cases/${c.id}`} className="hover:underline font-semibold">
                      {c.case_code}
                    </Link>
                    <span>- Kontrol günü geldi!</span>
                    {daysRemaining !== null && daysRemaining < 0 && (
                      <span className="text-orange-600">({Math.abs(daysRemaining)} gün geçti)</span>
                    )}
                  </div>
                );
              })}
              {cases.filter(c => {
                const pathologyCheckDue = shouldCheckPathology(c.operation_date) && !c.pathology_result_available;
                return pathologyCheckDue;
              }).map(c => {
                const daysSinceOp = getDaysSinceOperation(c.operation_date);
                return (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-red-800">
                    <span>🔬</span>
                    <Link href={`/cases/${c.id}`} className="hover:underline font-semibold">
                      {c.case_code}
                    </Link>
                    <span>- Patoloji sonucu kontrol edilmeli</span>
                    {daysSinceOp !== null && (
                      <span className="text-red-600">(Operasyondan {daysSinceOp} gün geçti)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cases Table */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Olgular</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-600">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium">Yükleniyor...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg font-semibold mb-2">Henüz olgu eklenmemiş</p>
              <p className="text-sm text-gray-500 mb-6">İlk olgunuzu ekleyerek başlayın</p>
              <Link
                href="/cases/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                ➕ İlk Olgunu Ekle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Olgu Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Bölge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-100">
                        {caseItem.case_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100">
                        {caseItem.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                        {new Date(caseItem.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${getStatusColor(
                            caseItem.status
                          )} border-current/30`}
                        >
                          {getStatusText(caseItem.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/cases/${caseItem.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            👁️ Görüntüle
                          </Link>
                          <Link
                            href={`/cases/${caseItem.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 border border-yellow-200 transition-colors"
                          >
                            ✏️ Düzenle
                          </Link>
                          <button
                            onClick={async () => {
                              if (!confirm(`"${caseItem.case_code}" olgusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
                                return;
                              }

                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) return;

                                const response = await fetch(`/api/cases/${caseItem.id}?user_id=${user.id}`, {
                                  method: 'DELETE',
                                });

                                if (!response.ok) {
                                  const error = await response.json();
                                  throw new Error(error.error || 'Olgu silinemedi');
                                }

                                // Reload cases
                                loadCases();
                                alert('Olgu başarıyla silindi');
                              } catch (error: unknown) {
                                const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
                                console.error('Error deleting case:', error);
                                alert(`Hata: ${errorMessage}`);
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
