'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Case } from '@/types/cases';
import { isFollowupDue, shouldCheckPathology, getFollowupDaysRemaining, getDaysSinceOperation } from '@/lib/utils/followup';

interface DashboardContentProps {
  user: { id: string; email?: string | null };
  profile: { full_name: string };
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    operated: 0,
    followup: 0,
  });

  useEffect(() => {
    loadCases();
  }, []);

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
        return 'bg-blue-100 text-blue-800';
      case 'operated':
        return 'bg-green-100 text-green-800';
      case 'postop_follow':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="glass shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/dashboard" className="text-2xl font-bold gradient-text">
              AI Yüz Rekonstrüksiyon Platformu
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Hoş geldiniz, Dr. {profile.full_name}</span>
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 text-gray-700 hover:text-red-600 font-medium rounded-xl hover:bg-white/50 transition-all duration-300"
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
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Olgularınızı yönetin ve takip edin</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/knowledge-base"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              📚 Bilgi Tabanı
            </Link>
            <Link
              href="/cases/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              ➕ Yeni Olgu Ekle
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">📋</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Toplam Olgu</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">📅</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.planned}</div>
            <div className="text-sm text-gray-600 font-medium">Planlı</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">✅</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.operated}</div>
            <div className="text-sm text-gray-600 font-medium">Opere</div>
          </div>
          <div className="glass rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">👁️</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.followup}</div>
            <div className="text-sm text-gray-600 font-medium">Takip</div>
          </div>
        </div>

          {/* Hatırlatmalar */}
          {cases.filter(c => {
            const followupDue = isFollowupDue(c.operation_date, c.followup_days || 21);
            const pathologyCheckDue = shouldCheckPathology(c.operation_date) && !c.pathology_result_available;
            return followupDue || pathologyCheckDue;
          }).length > 0 && (
            <div className="glass rounded-2xl shadow-xl p-6 border border-orange-200 bg-orange-50/50 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-xl font-bold text-orange-900">Hatırlatmalar</h2>
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
          <div className="glass rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="px-6 py-5 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <h2 className="text-xl font-bold text-gray-900">Olgular</h2>
            </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">Yükleniyor...</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-4">Henüz olgu eklenmemiş.</p>
              <Link
                href="/cases/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                İlk Olgunu Ekle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Olgu Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bölge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-white/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {caseItem.case_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {caseItem.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(caseItem.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(
                            caseItem.status
                          )}`}
                        >
                          {getStatusText(caseItem.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            href={`/cases/${caseItem.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                          >
                            👁️ Görüntüle
                          </Link>
                          <Link
                            href={`/cases/${caseItem.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200"
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
                              } catch (error: any) {
                                console.error('Error deleting case:', error);
                                alert(`Hata: ${error.message}`);
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
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

