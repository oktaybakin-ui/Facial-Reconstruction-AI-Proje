'use client';

import { HeroApple } from '@/components/ui/HeroApple';
import { ImportantNoticeCard } from '@/components/ui/ImportantNoticeCard';
import { PageContainer } from '@/components/ui/PageContainer';
import { useI18n } from '@/lib/i18n/context';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <PageContainer>
        <HeroApple />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            <Stat value={t('stats.ai')} label={t('stats.aiDesc')} color="text-blue-600" />
            <Stat value={t('stats.secure')} label={t('stats.secureDesc')} color="text-green-600" />
            <Stat value={t('stats.accessible')} label={t('stats.accessibleDesc')} color="text-purple-600" />
            <Stat value={t('stats.kvkk')} label={t('stats.kvkkDesc')} color="text-yellow-600" />
          </div>

          <ImportantNoticeCard />
        </section>

        <footer className="bg-white/80 backdrop-blur-sm border-t border-black/5 py-8 sm:py-10 mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-black/45">{t('footer.copyright2')}</p>
            <p className="mt-1 text-xs text-black/40">
              {t('footer.disclaimer')}
            </p>
          </div>
        </footer>
      </PageContainer>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-1">
      <div className={`text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2 tracking-tight ${color}`}>{value}</div>
      <div className="text-[10px] sm:text-xs text-black/50 font-medium">{label}</div>
    </div>
  );
}

