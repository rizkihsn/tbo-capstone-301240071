import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
    // Read from localStorage initially, fallback to light theme
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Optional: Check system preference
            // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            //     return 'dark';
            // }
        }
        return 'light';
    });

    useEffect(() => {
        // Apply class to HTML element for Tailwind dark mode (if enabled)
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
