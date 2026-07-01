import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Spinner = ({ className, size = 'md', variant = 'primary' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    const variants = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        white: 'text-white',
        muted: 'text-text-secondary'
    };

    return (
        <Loader2 
            className={cn(
                "animate-spin",
                sizes[size],
                variants[variant],
                className
            )} 
        />
    );
};
