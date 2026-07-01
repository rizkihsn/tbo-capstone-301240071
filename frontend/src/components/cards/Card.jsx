import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, hoverable = false, children, ...props }, ref) => {
    const Component = hoverable ? motion.div : 'div';
    const hoverProps = hoverable ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
    } : {};

    return (
        <Component
            ref={ref}
            className={cn(
                "rounded-xl border border-border bg-surface dark:bg-card-dark text-text-primary dark:text-white shadow-soft-sm transition-shadow duration-300",
                hoverable && "hover:shadow-soft-lg cursor-pointer",
                className
            )}
            {...hoverProps}
            {...props}
        >
            {children}
        </Component>
    );
});
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-h6 font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-small text-text-secondary dark:text-slate-300", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
