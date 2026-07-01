import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
        default: "bg-gray-100 text-gray-800 border-transparent",
        primary: "bg-blue-100 text-blue-800 border-transparent",
        success: "bg-green-100 text-green-800 border-transparent",
        warning: "bg-yellow-100 text-yellow-800 border-transparent",
        danger: "bg-red-100 text-red-800 border-transparent",
        outline: "text-text-primary border-border",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Badge.displayName = "Badge";

export { Badge };
