'use client';

import React from 'react';
import { HeroApple } from '@/components/ui/HeroApple';
import { ImportantNoticeCard } from '@/components/ui/ImportantNoticeCard';
import { PageContainer } from '@/components/ui/PageContainer';
import { useI18n } from '@/lib/i18n/context';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer>
        <HeroApple />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
            <Stat
              value={t('stats.ai')}
              label={t('stats.aiDesc')}
              icon={
                <svg className="w-5 h-5 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              }
            />
            <Stat
              value={t('stats.secure')}
              label={t('stats.secureDesc')}
              icon={
                <svg className="w-5 h-5 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
            />
            <Stat
              value={t('stats.accessible')}
              label={t('stats.accessibleDesc')}
              icon={
                <svg className="w-5 h-5 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              }
            />
            <Stat
              value={t('stats.kvkk')}
              label={t('stats.kvkkDesc')}
              icon={
                <svg className="w-5 h-5 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            />
          </div>

          <ImportantNoticeCard />
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 sm:py-10 mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm text-slate-500">{t('footer.copyright2')}</p>
            <p className="mt-1 text-xs text-slate-400">
              {t('footer.disclaimer')}
            </p>
          </div>
        </footer>
      </PageContainer>
    </div>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );
}
