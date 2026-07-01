import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading = false,
    disabled = false,
    fullWidth = false,
    startIcon,
    endIcon,
    type = 'button',
    onClick,
    ...props
}, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";
    
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus:ring-primary shadow-soft-sm",
        secondary: "bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary shadow-soft-sm",
        outline: "border-2 border-border bg-transparent text-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-400",
        ghost: "bg-transparent text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400",
        danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-soft-sm",
        success: "bg-success text-white hover:bg-green-600 focus:ring-success shadow-soft-sm",
    };

    const sizes = {
        xs: "h-8 px-3 text-xs rounded-sm",
        sm: "h-9 px-4 text-sm rounded-md",
        md: "h-11 px-6 text-body rounded-md",
        lg: "h-14 px-8 text-body-lg rounded-lg",
        icon: "h-11 w-11 rounded-md"
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth ? "w-full" : "",
                className
            )}
            onClick={onClick}
            whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
            whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
            transition={{ duration: 0.15 }} // Fast token
            {...props}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            
            {/* Start Icon */}
            {!isLoading && startIcon && (
                <span className="mr-2 inline-flex items-center">{startIcon}</span>
            )}
            
            <span className={cn("inline-flex items-center", isLoading && "opacity-80")}>
                {children}
            </span>

            {/* End Icon */}
            {!isLoading && endIcon && (
                <span className="ml-2 inline-flex items-center">{endIcon}</span>
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';
export default Button;
