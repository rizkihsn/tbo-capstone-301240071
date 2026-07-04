import React, { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none",
        {
          'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 focus:ring-cyan-500': variant === 'primary',
          'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700': variant === 'secondary',
          'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 focus:ring-red-500': variant === 'danger',
          'bg-transparent hover:bg-white/5 text-slate-300': variant === 'ghost',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
