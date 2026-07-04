import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'AutoSim — Automata Simulator',
  description: 'Platform interaktif untuk memvisualisasikan dan mensimulasikan mesin abstrak komputasi: DFA, NFA, PDA, Regex, CFG, dan CNF.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="flex min-h-screen bg-[#0a0e1a] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute inset-0 pointer-events-none animated-gradient-bg" />
          <div className="flex-1 overflow-y-auto p-8 relative z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
