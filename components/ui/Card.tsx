import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export function Card({ hover = false, glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
