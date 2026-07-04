import React, { InputHTMLAttributes } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full bg-slate-900/80 border border-slate-700 focus:border-cyan-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}
