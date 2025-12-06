'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormBoxProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthFormBox({ children, title, subtitle, className }: AuthFormBoxProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 relative">
      <div className={cn('w-full max-w-md', className)}>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
