'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface FeatureCardAppleProps {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function FeatureCardApple({
  icon,
  titleKey,
  descriptionKey,
  className,
}: FeatureCardAppleProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 group',
        className
      )}
    >
      <div className="flex flex-col">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition-colors duration-200">
          <span className="text-cyan-700">{icon}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
          {t(titleKey)}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
}
