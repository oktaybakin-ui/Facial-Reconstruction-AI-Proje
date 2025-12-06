'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface FeatureCardAppleProps {
  icon: string;
  iconColor: string;
  iconTextColor: string;
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function FeatureCardApple({ 
  icon, 
  iconColor,
  iconTextColor,
  titleKey, 
  descriptionKey,
  className 
}: FeatureCardAppleProps) {
  const { t } = useI18n();

  return (
    <div 
      className={cn(
        'bg-white rounded-3xl p-10 border border-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out group',
        className
      )}
    >
      <div className="flex flex-col">
        {/* Icon */}
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300', iconColor)}>
          <span className={cn('text-3xl', iconTextColor)}>{icon}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-semibold text-black/95 mb-4 tracking-tight group-hover:text-black transition-colors">
          {t(titleKey)}
        </h3>
        
        {/* Description */}
        <p className="text-base text-black/60 leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}

