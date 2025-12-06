'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface FeatureCardFlatProps {
  icon: string;
  iconColor: string;
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function FeatureCardFlat({ 
  icon, 
  iconColor,
  titleKey, 
  descriptionKey,
  className 
}: FeatureCardFlatProps) {
  const { t } = useI18n();

  return (
    <div 
      className={cn(
        'bg-white rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', iconColor)}>
          <span className="text-2xl">{icon}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {t(titleKey)}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}

