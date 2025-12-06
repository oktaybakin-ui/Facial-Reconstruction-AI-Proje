'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-black/10 shadow-sm">
      <button
        onClick={() => setLanguage('tr')}
        className={cn(
          'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300',
          language === 'tr'
            ? 'bg-blue-600 text-white shadow-md scale-105'
            : 'text-black/60 hover:text-black/80 hover:bg-black/5'
        )}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300',
          language === 'en'
            ? 'bg-blue-600 text-white shadow-md scale-105'
            : 'text-black/60 hover:text-black/80 hover:bg-black/5'
        )}
      >
        EN
      </button>
    </div>
  );
}
