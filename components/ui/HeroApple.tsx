'use client';

import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';

export function HeroApple() {
  const { t } = useI18n();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-20 md:pt-32 md:pb-28">
      {/* Hero Content */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-cyan-600"></span>
            {t('hero.badge')}
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            {t('hero.title')}
            <span className="block text-cyan-700 mt-2">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold"
              >
                {t('nav.getStarted')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold"
              >
                {t('nav.signIn')}
              </Button>
            </Link>
          </div>

          {/* Bullet Points */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 justify-center">
            <Bullet text={t('hero.bullet1')} />
            <Bullet text={t('hero.bullet2')} />
            <Bullet text={t('hero.bullet3')} />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera / Image Upload Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 group">
          <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors duration-200">
            <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
            {t('feature.image.title')}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('feature.image.desc')}
          </p>
        </div>

        {/* Brain / AI Analysis Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 group">
          <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors duration-200">
            <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
            {t('feature.analysis.title')}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('feature.analysis.desc')}
          </p>
        </div>

        {/* Shield / Security Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 group">
          <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors duration-200">
            <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
            {t('feature.storage.title')}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t('feature.storage.desc')}
          </p>
        </div>
      </div>
    </section>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg className="h-4 w-4 text-cyan-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
      </svg>
      <span className="font-medium text-slate-600">{text}</span>
    </div>
  );
}
