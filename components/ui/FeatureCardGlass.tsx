'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface FeatureCardGlassProps {
  icon: string;
  titleKey: string;
  descriptionKey: string;
  gradientFrom: string;
  gradientTo: string;
  className?: string;
}

export function FeatureCardGlass({ 
  icon, 
  titleKey, 
  descriptionKey, 
  gradientFrom, 
  gradientTo,
  className 
}: FeatureCardGlassProps) {
  const { t } = useI18n();

  return (
    <div 
      className={cn(
        'group relative bg-white/12 backdrop-blur-2xl rounded-3xl p-10 border border-white/25',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]',
        'hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500 ease-out',
        'hover:border-white/40 hover:bg-white/18',
        className
      )}
    >
      {/* Gradient Overlay on Hover - Enhanced */}
      <div 
        className={cn(
          'absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700',
          `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
        )}
      />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon - Enhanced */}
        <div 
          className={cn(
            'w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
            'group-hover:scale-125 group-hover:rotate-6 transition-all duration-700',
            'group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)]',
            `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
          )}
        >
          <span className="text-4xl drop-shadow-lg">{icon}</span>
        </div>
        
        {/* Title - Enhanced */}
        <h3 className="text-2xl font-black text-slate-900 mb-5 group-hover:text-white transition-colors duration-500 drop-shadow-lg">
          {t(titleKey)}
        </h3>
        
        {/* Description - Enhanced */}
        <p className="text-slate-700 leading-relaxed text-base group-hover:text-white/95 transition-colors duration-500 font-medium">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}
