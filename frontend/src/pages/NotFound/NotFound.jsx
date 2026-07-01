import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../../components/buttons/Button';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full text-center"
            >
                <div className="relative mb-8">
                    <div className="text-[120px] font-bold font-heading text-slate-100 dark:text-slate-800 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary/10 text-primary p-4 rounded-full">
                            <Search size={48} />
                        </div>
                    </div>
                </div>
                
                <h1 className="text-h3 font-bold text-text-primary mb-4">Page not found</h1>
                <p className="text-text-secondary mb-8 leading-relaxed">
                    Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is misspelled.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/">
                        <Button startIcon={<Home size={18} />} fullWidth>
                            Back to Home
                        </Button>
                    </Link>
                    <Button variant="outline" startIcon={<ArrowLeft size={18} />} onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
