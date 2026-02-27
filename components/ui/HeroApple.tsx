'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';

/* ------------------------------------------------------------------ */
/*  Floating Particles                                                 */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${20 + i * 15}px`,
            height: `${20 + i * 15}px`,
            background: `rgba(255, 255, 255, ${0.1 + i * 0.05})`,
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `float-particle ${6 + i * 2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Hero Component                                                */
/* ------------------------------------------------------------------ */

export function HeroApple() {
  const { t } = useI18n();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  /* ── Feature data (translated) ── */
  const features = useMemo(() => [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      ),
      title: t('hero.feature.preopTitle'),
      description: t('hero.feature.preopDesc'),
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      title: t('hero.feature.flapTitle'),
      description: t('hero.feature.flapDesc'),
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
      title: t('hero.feature.riskTitle'),
      description: t('hero.feature.riskDesc'),
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: t('hero.feature.kvkkTitle'),
      description: t('hero.feature.kvkkDesc'),
      gradient: 'from-amber-500 to-orange-600',
    },
  ], [t]);

  /* ── Stats data (translated) ── */
  const stats = useMemo(() => [
    { label: t('hero.stat.flaps'), value: '25+' },
    { label: t('hero.stat.analysisTime'), value: '<30sn' },
    { label: t('hero.stat.accuracy'), value: '%94' },
  ], [t]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <>
      {/* ── Full-width dark hero with animation ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-cyan-300 mb-6">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                {t('hero.badge')}
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                {t('hero.title')}
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">
                  {t('hero.titleHighlight')}
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-8 max-w-xl">
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
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
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {t('nav.signIn')}
                  </Button>
                </Link>
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                {stats.map((stat, idx) => (
                  <div key={idx}>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Animated feature showcase */}
            <div
              className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className={`w-full text-left flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-500 ${
                      activeFeature === idx
                        ? 'bg-white/10 border-white/20 backdrop-blur-sm shadow-lg shadow-cyan-500/10'
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        activeFeature === idx
                          ? `bg-gradient-to-br ${feature.gradient} text-white shadow-lg`
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                          activeFeature === idx ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm mt-0.5 transition-all duration-500 overflow-hidden ${
                          activeFeature === idx
                            ? 'text-slate-400 max-h-10 opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                    {activeFeature === idx && (
                      <div className="flex-shrink-0 w-1 h-8 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"
                          style={{
                            animation: 'progress-fill 4s linear',
                            height: '100%',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes float-particle {
            0% { transform: translateY(0px) scale(1); }
            100% { transform: translateY(-30px) scale(1.2); }
          }
          @keyframes progress-fill {
            0% { transform: translateY(100%); }
            100% { transform: translateY(0%); }
          }
        `}</style>
      </section>

      {/* ── Feature Cards (below hero, light background) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            }
            title={t('feature.image.title')}
            desc={t('feature.image.desc')}
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            }
            title={t('feature.analysis.title')}
            desc={t('feature.analysis.desc')}
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-cyan-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
            title={t('feature.storage.title')}
            desc={t('feature.storage.desc')}
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 group">
      <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors duration-200">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
