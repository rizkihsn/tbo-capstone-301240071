"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Network, 
  Regex, 
  Database, 
  Type, 
  GitCommit, 
  Home,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Finite State Automata', path: '/fsa', icon: <Network size={20} />, color: 'text-blue-400' },
    { name: 'Moore & Mealy', path: '/transducer', icon: <GitCommit size={20} />, color: 'text-orange-400' },
    { name: 'Regular Expression', path: '/regex', icon: <Regex size={20} />, color: 'text-pink-400' },
    { name: 'Pushdown Automata', path: '/pda', icon: <Database size={20} />, color: 'text-cyan-400' },
    { name: 'Context Free Grammar', path: '/cfg', icon: <Type size={20} />, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-64 h-screen glass-panel flex flex-col p-4 border-r border-white/10 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-glow">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 font-outfit">
            AutoSim
          </h1>
          <p className="text-[10px] text-slate-500 -mt-0.5">Automata Simulator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">Modul</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive 
                  ? 'active' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`transition-colors ${isActive ? (item.color || 'text-blue-400') : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </div>
              <span className={`text-sm ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="glass-panel rounded-xl p-3 text-center">
          <p className="text-[10px] text-slate-500 font-medium">Capstone Project</p>
          <p className="text-xs text-slate-400 font-bold mt-0.5">Teori Bahasa & Otomata</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
