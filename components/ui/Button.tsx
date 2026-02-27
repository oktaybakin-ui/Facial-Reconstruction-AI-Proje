import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-cyan-700 text-white hover:bg-cyan-800 active:bg-cyan-900 shadow-sm hover:shadow-md focus-visible:ring-cyan-600',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus-visible:ring-slate-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
    tertiary: 'text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 active:bg-cyan-100 focus-visible:ring-cyan-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
