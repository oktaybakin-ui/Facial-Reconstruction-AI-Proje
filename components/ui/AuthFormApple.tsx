'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormAppleProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthFormApple({ 
  children, 
  title, 
  subtitle,
  className 
}: AuthFormAppleProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12">
      <div 
        className={cn(
          'bg-white rounded-3xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-black/5 w-full max-w-md p-8 md:p-10',
          className
        )}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black/90 mb-2 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-black/50">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}

