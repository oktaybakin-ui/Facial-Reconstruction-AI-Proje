'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardMetricCardAppleProps {
  icon: string;
  value: number;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-100'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100'
  }
};

export function DashboardMetricCardApple({ 
  icon, 
  value, 
  label,
  color,
  className 
}: DashboardMetricCardAppleProps) {
  const styles = colorStyles[color];

  return (
    <div 
      className={cn(
        'bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.bg)}>
          <span className={cn('text-xl', styles.text)}>{icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="text-3xl font-semibold text-black/90 mb-1 tracking-tight">
            {value}
          </div>
          <div className="text-sm text-black/50 font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

