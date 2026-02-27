import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600',
          'hover:border-slate-300',
          'transition-colors duration-150',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
