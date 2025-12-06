'use client';

import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';
import { FeatureCardApple } from './FeatureCardApple';

export function HeroApple() {
  const { t } = useI18n();

  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Background Gradient Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/40 blur-3xl animate-pulse"></div>
        <div className="absolute top-20 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/40 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto mb-24">
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-black/70 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('hero.badge')}
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black/95 tracking-tight leading-[1.1] mb-6">
            {t('hero.title')}
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed mb-8 font-light">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
                {t('nav.getStarted')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 hover:bg-black/5 transition-all duration-300">
                {t('nav.signIn')}
              </Button>
            </Link>
          </div>

          {/* Bullet Points */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-black/60 justify-center">
            <Bullet text={t('hero.bullet1')} color="bg-blue-500" />
            <Bullet text={t('hero.bullet2')} color="bg-purple-500" />
            <Bullet text={t('hero.bullet3')} color="bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Video Section - Pre-op Yükleme'nin üstünde */}
      <div className="mt-24 mb-16 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-black/5 shadow-xl overflow-hidden">
            <div className="aspect-video relative">
              <video
                src="/videos/face.mp4"
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                preload="auto"
              >
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCardApple
          icon="📸"
          iconColor="bg-blue-50"
          iconTextColor="text-blue-600"
          titleKey="feature.image.title"
          descriptionKey="feature.image.desc"
        />
        <FeatureCardApple
          icon="🧠"
          iconColor="bg-purple-50"
          iconTextColor="text-purple-600"
          titleKey="feature.analysis.title"
          descriptionKey="feature.analysis.desc"
        />
        <FeatureCardApple
          icon="🔒"
          iconColor="bg-green-50"
          iconTextColor="text-green-600"
          titleKey="feature.storage.title"
          descriptionKey="feature.storage.desc"
        />
      </div>
    </section>
  );
}

function Bullet({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${color} animate-pulse`}></span>
      <span className="font-medium">{text}</span>
    </div>
  );
}

function ConceptPanel() {
  const { t } = useI18n();
  
  return (
    <div className="relative z-10">
      {/* Glow Effect */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-200/60 via-purple-200/60 to-indigo-200/60 blur-2xl opacity-60 animate-pulse"></div>
      
      {/* Main Card */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-black/10 shadow-2xl p-8 md:p-10 hover:shadow-3xl transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-black/50 uppercase tracking-wider mb-1">
              {t('concept.title')}
            </p>
            <p className="text-lg font-bold text-black/90">
              {t('concept.subtitle')}
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
            {t('concept.badge')}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-[1.2fr,1fr] gap-6 mb-6">
          {/* Face Mock */}
          <FaceMock />
          {/* Info */}
          <ConceptInfo />
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-black/5 px-4 py-3.5">
          <p className="text-xs text-black/60 leading-relaxed">
            {t('concept.note')}
          </p>
        </div>
      </div>
    </div>
  );
}

function FaceMock() {
  return (
    <div className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border border-blue-200/30 p-6 h-full min-h-[180px]">
      <div className="relative w-24 h-32 rounded-full border-2 border-blue-300/70 bg-white shadow-lg">
        {/* Vertical Line */}
        <div className="absolute inset-y-8 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-500/70 to-blue-400/50"></div>
        {/* Horizontal Line */}
        <div className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-blue-400/50 to-blue-500/70"></div>
        {/* Inner Circle */}
        <div className="absolute inset-4 rounded-full border border-blue-300/40"></div>
        {/* Corner Indicators */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-400/60"></div>
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400/60"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-blue-400/60"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-blue-400/60"></div>
      </div>
    </div>
  );
}

function ConceptInfo() {
  const { t } = useI18n();
  
  return (
    <div className="space-y-4">
      <InfoRow label={t('concept.region')} value={t('concept.regionValue')} />
      <InfoRow label={t('concept.size')} value={t('concept.sizeValue')} />
      <InfoRow label={t('concept.zone')} value={t('concept.zoneValue')} accent />
    </div>
  );
}

function InfoRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-black/5 last:border-0">
      <span className="text-xs font-semibold text-black/50 uppercase tracking-wide">{label}</span>
      <span
        className={
          accent
            ? "rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 px-3 py-1 text-xs font-bold text-red-700 shadow-sm"
            : "text-xs font-semibold text-black/80"
        }
      >
        {value}
      </span>
    </div>
  );
}
