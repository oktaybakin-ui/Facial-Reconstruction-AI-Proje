'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Case } from '@/types/cases';
import { isAdmin } from '@/lib/auth/admin';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/lib/i18n/context';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

// ---------------------------------------------------------------------------
// SVG Icon Components
// ---------------------------------------------------------------------------

function IconClipboardList({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function IconCalendar({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconCheckCircle({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconBell({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function IconPlus({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconEye({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconPencil({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function IconTrash({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function IconCog({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconBook({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function IconLogout({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

function IconFolder({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  accentColor: string; // tailwind border-t color class e.g. "border-t-cyan-700"
}

function StatCard({ icon, value, label, accentColor }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
      <div className={`h-1 ${accentColor}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
          </div>
          <div className="text-slate-400">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface DashboardContentProps {
  user: { id: string; email?: string | null };
  profile: { full_name: string };
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter();
  useI18n(); // keep provider active
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
        } catch (err: unknown) {
          console.error('Error deleting case:', err);
          showError(err instanceof Error ? err.message : 'Olgu silinirken bir hata oluştu');
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      planned: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: 'Planlı' },
      operated: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', label: 'Opere' },
      postop_follow: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'Takip' },
      completed: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', label: 'Tamamlandı' },
    };
    return config[status] || config.completed;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Welcome */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-700 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {profile.full_name}
                </p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            {/* Right: Nav Actions */}
            <div className="flex items-center gap-2">
              {adminStatus.isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <IconCog className="w-4 h-4" />
                    <span className="hidden sm:inline">Yönetici</span>
                  </Button>
                </Link>
              )}
              <Link href="/knowledge-base">
                <Button variant="ghost" size="sm">
                  <IconBook className="w-4 h-4" />
                  <span className="hidden sm:inline">Bilgi Tabanı</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <IconLogout className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Main Content */}
      {/* ----------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner + New Case CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hoşgeldiniz, {profile.full_name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Olgularınızı yönetin ve takip edin
            </p>
          </div>
          <Link href="/cases/new">
            <Button size="md">
              <IconPlus className="w-4 h-4" />
              Yeni Olgu
            </Button>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Stat Cards */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<IconClipboardList className="w-6 h-6" />}
            value={stats.total}
            label="Toplam Olgu"
            accentColor="bg-cyan-700"
          />
          <StatCard
            icon={<IconCalendar className="w-6 h-6" />}
            value={stats.planned}
            label="Planlı"
            accentColor="bg-blue-500"
          />
          <StatCard
            icon={<IconCheckCircle className="w-6 h-6" />}
            value={stats.operated}
            label="Opere"
            accentColor="bg-emerald-500"
          />
          <StatCard
            icon={<IconBell className="w-6 h-6" />}
            value={stats.followup}
            label="Takip"
            accentColor="bg-amber-500"
          />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Cases Section */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Olgular</h2>
            <span className="text-xs font-medium text-slate-400">
              {stats.total} kayıt
            </span>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-16 text-center">
              <svg className="mx-auto h-8 w-8 text-cyan-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-slate-400 mt-3">Olgular yükleniyor...</p>
            </div>

          /* Empty State */
          ) : cases.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <IconFolder className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Henüz olgu yok
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                İlk olgunuzu ekleyerek AI destekli yüz rekonstrüksiyon analizine başlayın.
              </p>
              <Link href="/cases/new">
                <Button size="md">
                  <IconPlus className="w-4 h-4" />
                  İlk Olgunuzu Ekleyin
                </Button>
              </Link>
            </div>

          /* Table */
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Olgu Kodu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Bölge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((caseItem) => {
                    const badge = getStatusBadge(caseItem.status);
                    return (
                      <tr
                        key={caseItem.id}
                        className="hover:bg-slate-50/60 transition-colors duration-150"
                      >
                        {/* Case Code */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/cases/${caseItem.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-cyan-700 transition-colors"
                          >
                            {caseItem.case_code}
                          </Link>
                        </td>

                        {/* Region */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {caseItem.region}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(caseItem.created_at).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <Link href={`/cases/${caseItem.id}`}>
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors duration-150"
                                title="Görüntüle"
                              >
                                <IconEye />
                              </button>
                            </Link>

                            {/* Edit */}
                            <Link href={`/cases/${caseItem.id}/edit`}>
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                                title="Düzenle"
                              >
                                <IconPencil />
                              </button>
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteCase(caseItem.id, caseItem.case_code)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                              title="Sil"
                            >
                              <IconTrash />
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
        </div>
      </main>
    </div>
  );
}
