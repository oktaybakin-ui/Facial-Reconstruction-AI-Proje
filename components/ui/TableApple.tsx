'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableAppleProps {
  children: React.ReactNode;
  className?: string;
}

export function TableApple({ children, className }: TableAppleProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-2xl border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

