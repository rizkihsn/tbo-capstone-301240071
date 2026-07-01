import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EmptyState = ({ 
    icon: Icon = FileQuestion, 
    title = 'No Data Found', 
    description = 'There is currently nothing to show here.', 
    action,
    className
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn("flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-gray-50/50 dark:bg-slate-800/20", className)}
        >
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-text-secondary">
                <Icon size={32} />
            </div>
            <h3 className="text-h6 font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-small text-text-secondary max-w-sm mb-6">{description}</p>
            {action && (
                <div>{action}</div>
            )}
        </motion.div>
    );
};
