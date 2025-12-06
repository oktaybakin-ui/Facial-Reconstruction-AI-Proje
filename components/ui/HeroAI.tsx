'use client';

import Link from 'next/link';
import { Button } from './Button';
import { useI18n } from '@/lib/i18n/context';

export function HeroAI() {
  const { t } = useI18n();

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-40 md:py-52">
      {/* Enhanced Glow Behind Headline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-purple-500/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-full blur-3xl -translate-x-32 -translate-y-20"></div>
      </div>

      <div className="relative text-center animate-fadeIn">
        {/* Medical AI Badge - Enhanced */}
        <div className="inline-flex items-center gap-3 mb-10 px-6 py-3 bg-white/15 backdrop-blur-2xl rounded-full border border-white/40 shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:scale-[1.05] hover:bg-white/20 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)]">
          <span className="text-xl">🏥</span>
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {t('hero.badge')}
          </span>
        </div>
        
        {/* Main Headline - Enhanced Typography */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black mb-10 leading-[0.95] tracking-tighter">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-3 drop-shadow-2xl">
            {t('hero.title1')}
          </span>
          <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">{t('hero.title2')}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mt-3 drop-shadow-2xl">
            {t('hero.title3')}
          </span>
        </h1>
        
        {/* Subheading - Enhanced */}
        <p 
          className="text-2xl sm:text-3xl md:text-4xl text-white/95 max-w-4xl mx-auto leading-tight mb-6 font-semibold drop-shadow-lg"
          dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }}
        />
        
        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-16 font-medium drop-shadow-md">
          {t('hero.description')}
        </p>

        {/* CTA Buttons - Enhanced */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link href="/auth/register">
            <Button size="lg" className="group relative overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_48px_rgba(59,130,246,0.5)] hover:-translate-y-1 text-lg px-10 py-4">
              <span className="relative z-10 flex items-center gap-3 font-bold">
                {t('hero.getStarted')}
                <span className="group-hover:translate-x-2 transition-transform duration-300 text-2xl">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white/15 backdrop-blur-2xl border-2 border-white/40 hover:bg-white/25 hover:border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 text-lg px-10 py-4 font-bold text-white"
            >
              {t('hero.signIn')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
