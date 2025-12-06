import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2.5">
      {label && (
        <label className="block text-sm font-semibold text-black/70">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 bg-white border border-black/10 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          'transition-all duration-200 text-black/90 placeholder-black/30',
          'hover:border-black/20',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
