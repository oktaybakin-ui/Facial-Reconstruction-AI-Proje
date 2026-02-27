'use client';

import React from 'react';
import { HeroApple } from '@/components/ui/HeroApple';
import { ImportantNoticeCard } from '@/components/ui/ImportantNoticeCard';
import { useI18n } from '@/lib/i18n/context';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero: full-width dark section with animation + feature cards */}
      <HeroApple />

      {/* Notice + Footer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <ImportantNoticeCard />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-500">{t('footer.copyright2')}</p>
          <p className="mt-1 text-xs text-slate-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
