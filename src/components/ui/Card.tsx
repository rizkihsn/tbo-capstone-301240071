import React, { HTMLAttributes } from 'react';
import { cn } from './Button';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'pink' | 'blue' | 'emerald' | 'orange' | 'purple' | 'red';
}

export function Card({ className, glow, children, ...props }: CardProps) {
  const glowMap = {
    cyan: 'shadow-cyan-500/20',
    pink: 'shadow-pink-500/20',
    blue: 'shadow-blue-500/20',
    emerald: 'shadow-emerald-500/20',
    orange: 'shadow-orange-500/20',
    purple: 'shadow-purple-500/20',
    red: 'shadow-red-500/20',
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-5",
        glow && glowMap[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
