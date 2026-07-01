/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#2563EB",
                    hover: "#1D4ED8",
                    active: "#1E40AF"
                },
                secondary: {
                    DEFAULT: "#06B6D4",
                    hover: "#0891B2"
                },
                accent: "#7C3AED",
                success: "#22C55E",
                warning: "#F59E0B",
                danger: "#EF4444",
                info: "#3B82F6",
                background: {
                    DEFAULT: "#F8FAFC",
                    dark: "#0F172A"
                },
                surface: {
                    DEFAULT: "#FFFFFF",
                    dark: "#1E293B"
                },
                card: {
                    dark: "#1E293B"
                },
                "text-primary": {
                    DEFAULT: "#111827",
                    dark: "#F8FAFC"
                },
                "text-secondary": {
                    DEFAULT: "#6B7280",
                    dark: "#CBD5E1"
                },
                border: {
                    DEFAULT: "#E5E7EB",
                    dark: "#334155"
                },
                divider: "#F1F5F9"
            },
            fontFamily: {
                sans: ["Poppins", "sans-serif"],
            },
            fontSize: {
                'display': ['60px', '120%'],
                'h1': ['48px', '120%'],
                'h2': ['36px', '120%'],
                'h3': ['30px', '120%'],
                'h4': ['24px', '120%'],
                'h5': ['20px', '120%'],
                'h6': ['18px', '120%'],
                'body-lg': ['18px', '170%'],
                'body': ['16px', '170%'],
                'small': ['14px', '170%'],
                'caption': ['12px', '150%'],
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
                'full': '9999px',
            },
            boxShadow: {
                'soft-sm': '0 2px 8px -2px rgba(0,0,0,0.05), 0 1px 4px -1px rgba(0,0,0,0.03)',
                'soft-md': '0 12px 24px -6px rgba(0,0,0,0.06), 0 6px 12px -4px rgba(0,0,0,0.04)',
                'soft-lg': '0 20px 40px -8px rgba(0,0,0,0.08), 0 12px 24px -6px rgba(0,0,0,0.05)'
            },
            transitionDuration: {
                'fast': '150ms',
                'normal': '250ms',
                'medium': '350ms',
                'slow': '500ms',
                'very-slow': '750ms',
            }
        },
    },
    plugins: [],
};