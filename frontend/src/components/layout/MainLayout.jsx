import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, Moon, Sun, Github, Search, Command } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { CommandPalette } from '../navigation/CommandPalette';

const navLinks = [
    { name: 'DFA', path: '/dfa' },
    { name: 'Regex', path: '/regex' },
    { name: 'PDA', path: '/pda' },
    { name: 'CNF', path: '/cnf' },
    { name: 'Docs', path: '/documentation' },
    { name: 'About', path: '/about' }
];

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Handle Navbar scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Global keyboard shortcut for Command Palette
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            {/* Command Palette */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />

            {/* Navbar */}
            <header className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                isScrolled ? "glass dark:glass-dark" : "bg-transparent border-b border-transparent py-2"
            )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary text-white rounded-lg group-hover:bg-primary-hover transition-colors shadow-soft-sm">
                                <Cpu size={20} />
                            </div>
                            <span className="font-heading font-bold text-lg tracking-tight text-text-primary">
                                Automata<span className="text-primary">Lab</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        cn(
                                            "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-text-primary"
                                        )
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                            >
                                <Search size={14} />
                                <span className="hidden lg:inline-block">Search...</span>
                                <span className="flex items-center gap-0.5 text-xs font-semibold opacity-60">
                                    <Command size={10} /> K
                                </span>
                            </button>

                            <div className="h-6 w-px bg-border mx-2"></div>

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-md text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-md text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Github size={18} />
                            </a>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden gap-2">
                            <button
                                onClick={() => setIsCommandPaletteOpen(true)}
                                className="p-2 rounded-md text-text-secondary"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-text-secondary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden glass dark:glass-dark absolute w-full border-b border-border shadow-soft-lg">
                        <div className="px-4 pt-2 pb-6 space-y-1 bg-white/95 dark:bg-slate-900/95">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            "block px-3 py-3 rounded-md text-base font-medium transition-colors",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-text-primary"
                                        )
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <div className="pt-4 mt-2 border-t border-border flex gap-4">
                                <button
                                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-text-secondary hover:bg-gray-50 dark:hover:bg-slate-800 w-full"
                                >
                                    {theme === 'dark' ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full pt-16">
                <Outlet />
            </main>

            {/* Premium Footer */}
            <footer className="border-t border-border bg-white dark:bg-card-dark mt-auto py-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 sm:col-span-2 md:col-span-2">
                            <Link to="/" className="flex items-center gap-2 group mb-4">
                                <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                    <Cpu size={20} />
                                </div>
                                <span className="font-heading font-bold text-lg text-text-primary">
                                    AutomataLab
                                </span>
                            </Link>
                            <p className="text-small text-text-secondary max-w-sm mb-4">
                                A premium educational platform for building, simulating, and visualizing Automata Theory and Formal Languages.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-text-secondary hover:text-primary transition-colors p-1 -ml-1"><Github size={20} /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary mb-4">Features</h4>
                            <ul className="space-y-1 text-small">
                                <li><Link to="/dfa" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">DFA Simulator</Link></li>
                                <li><Link to="/regex" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">Regex Tester</Link></li>
                                <li><Link to="/pda" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">PDA Builder</Link></li>
                                <li><Link to="/cnf" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">CNF Converter</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary mb-4">Resources</h4>
                            <ul className="space-y-1 text-small">
                                <li><Link to="/documentation" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">Documentation</Link></li>
                                <li><Link to="/about" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">About Project</Link></li>
                                <li><a href="#" className="block py-1.5 text-text-secondary hover:text-primary transition-colors">API Reference</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-divider flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
                        <p>&copy; {new Date().getFullYear()} AutomataLab. Built with React & Tailwind.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
