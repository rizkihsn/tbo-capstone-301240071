import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X, Cpu, Book, Code, Layers } from 'lucide-react';
import { cn } from '../../utils/cn';

const commands = [
    { id: 'home', title: 'Home', icon: Cpu, path: '/' },
    { id: 'dfa', title: 'DFA Simulator', icon: Cpu, path: '/dfa' },
    { id: 'regex', title: 'Regex Tester', icon: Code, path: '/regex' },
    { id: 'pda', title: 'PDA Builder', icon: Layers, path: '/pda' },
    { id: 'cnf', title: 'CNF Converter', icon: Layers, path: '/cnf' },
    { id: 'docs', title: 'Documentation', icon: Book, path: '/documentation' },
];

export const CommandPalette = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const filteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                isOpen ? onClose() : onClose(false); // Quick hack to toggle from parent via context if needed, but here it's handled globally
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSelect = (path) => {
        navigate(path);
        onClose();
        setSearch('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl bg-surface dark:bg-card-dark rounded-xl shadow-soft-lg border border-border overflow-hidden pointer-events-auto"
                        >
                            <div className="flex items-center px-4 py-4 border-b border-border">
                                <Search className="text-text-secondary mr-3" size={20} />
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent text-text-primary text-body placeholder:text-text-secondary focus:outline-none"
                                    placeholder="Type a command or search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-2">
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-xs rounded font-medium text-text-secondary">
                                        <Command size={12} /> K
                                    </span>
                                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {filteredCommands.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredCommands.map((cmd) => {
                                            const Icon = cmd.icon;
                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => handleSelect(cmd.path)}
                                                    className="w-full flex items-center px-4 py-3 rounded-md text-text-primary hover:bg-primary/10 hover:text-primary transition-colors text-left"
                                                >
                                                    <Icon className="mr-3 opacity-70" size={18} />
                                                    <span className="font-medium text-sm">{cmd.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-4 py-12 text-center text-text-secondary">
                                        <p className="text-sm">No results found for "{search}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
