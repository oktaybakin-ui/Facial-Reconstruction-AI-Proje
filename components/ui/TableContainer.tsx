'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, className }: TableContainerProps) {
  return (
    <div className={cn(
      'bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden',
      className
    )}>
      {children}
    </div>
  );
}

