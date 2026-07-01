import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(({
    className,
    type = 'text',
    label,
    error,
    helperText,
    prefix,
    suffix,
    disabled = false,
    required = false,
    fullWidth = true,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "")}>
            {label && (
                <label className="text-sm font-medium text-text-primary flex justify-between">
                    <span>
                        {label} {required && <span className="text-danger ml-0.5">*</span>}
                    </span>
                </label>
            )}
            
            <div className="relative flex items-center group">
                {prefix && (
                    <div className="absolute left-3 text-text-secondary">
                        {prefix}
                    </div>
                )}
                
                <input
                    type={inputType}
                    className={cn(
                        "flex h-11 w-full rounded-md border bg-white px-3 py-2 text-body transition-colors",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
                        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
                        "dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus-visible:ring-primary",
                        error ? "border-danger focus-visible:ring-danger focus-visible:border-danger" : "border-border hover:border-gray-300 dark:hover:border-slate-500",
                        prefix && "pl-10",
                        (suffix || isPassword || error) && "pr-10",
                        className
                    )}
                    ref={ref}
                    disabled={disabled}
                    aria-invalid={!!error}
                    {...props}
                />
                
                {/* Suffix / Password Toggle / Error Icon */}
                <div className="absolute right-3 flex items-center gap-2">
                    {error && !isPassword && (
                        <AlertCircle className="h-5 w-5 text-danger" />
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-text-secondary hover:text-text-primary focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    )}
                    {suffix && !isPassword && (
                        <span className="text-text-secondary">{suffix}</span>
                    )}
                </div>
            </div>

            {/* Helper or Error Text */}
            {(error || helperText) && (
                <p className={cn(
                    "text-xs font-medium",
                    error ? "text-danger" : "text-text-secondary"
                )}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";
