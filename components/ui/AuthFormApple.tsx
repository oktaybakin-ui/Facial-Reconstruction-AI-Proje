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
  className,
}: AuthFormAppleProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 sm:px-6 py-12">
      <div
        className={cn(
          'bg-white rounded-xl shadow-md border border-slate-200 w-full max-w-md p-8 md:p-10',
          className
        )}
      >
        {/* Brand Mark */}
        <div className="flex justify-center mb-6">
          <div className="w-11 h-11 rounded-lg bg-cyan-700 flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1.5 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}
