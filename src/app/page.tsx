import React from 'react';
import { ArrowRight, Sparkles, Network, BookOpen, Cpu, Database, GitCommit, Type } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: "Finite State Automata",
      description: "DFA, NFA, dan konversi NFA→DFA dengan visualisasi graf interaktif step-by-step.",
      icon: <Network className="w-7 h-7" />,
      link: "/fsa",
      gradient: "from-blue-500 to-indigo-600",
      glowColor: "shadow-blue-500/20",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      title: "Moore & Mealy",
      description: "Simulasi mesin Transducer yang menghasilkan output untuk setiap input string.",
      icon: <GitCommit className="w-7 h-7" />,
      link: "/transducer",
      gradient: "from-orange-500 to-amber-600",
      glowColor: "shadow-orange-500/20",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      iconColor: "text-orange-400",
    },
    {
      title: "Regular Expression",
      description: "Parser Regex ke AST dan konversi otomatis ke NFA via Thompson's Construction.",
      icon: <BookOpen className="w-7 h-7" />,
      link: "/regex",
      gradient: "from-pink-500 to-rose-600",
      glowColor: "shadow-pink-500/20",
      iconBg: "bg-pink-500/10 border-pink-500/20",
      iconColor: "text-pink-400",
    },
    {
      title: "Pushdown Automata",
      description: "Simulasi PDA dengan visualisasi Memory Stack (LIFO) secara real-time.",
      icon: <Database className="w-7 h-7" />,
      link: "/pda",
      gradient: "from-cyan-500 to-teal-600",
      glowColor: "shadow-cyan-500/20",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      iconColor: "text-cyan-400",
    },
    {
      title: "Context Free Grammar",
      description: "Representasi CFG, Parse Tree (D3.js), dan konversi ke Chomsky Normal Form.",
      icon: <Type className="w-7 h-7" />,
      link: "/cfg",
      gradient: "from-emerald-500 to-green-600",
      glowColor: "shadow-emerald-500/20",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  const stats = [
    { label: "Modul", value: "5" },
    { label: "Algoritma", value: "12+" },
    { label: "Visualisasi", value: "Interaktif" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 animated-gradient-bg">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-5 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 animate-border-glow">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-blue-400 font-medium text-sm">Capstone Project — Teori Bahasa & Otomata</span>
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tight font-outfit leading-tight">
          <span className="text-white">Automata </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Simulator
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Platform interaktif untuk memvisualisasikan, mensimulasikan, dan memahami 
          mesin abstrak komputasi — dari DFA hingga CNF.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 pt-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl font-bold text-white font-outfit">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, idx) => (
          <Link 
            href={feature.link} 
            key={idx} 
            className="group block"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={`feature-card h-full p-6 rounded-2xl glass-panel hover:shadow-xl ${feature.glowColor}`}>
              {/* Icon */}
              <div className={`feature-card-icon w-12 h-12 rounded-xl ${feature.iconBg} border flex items-center justify-center mb-5 transition-transform duration-300`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2 font-outfit group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                {feature.description}
              </p>
              
              {/* CTA */}
              <div className="flex items-center text-sm font-semibold text-slate-500 group-hover:text-white transition-all">
                <span className={`w-8 h-[2px] mr-3 bg-gradient-to-r ${feature.gradient} rounded-full transition-all group-hover:w-12`} />
                Eksplorasi
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hierarki Chomsky Section */}
      <div className="mt-16 glass-panel rounded-2xl p-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-bold text-white font-outfit mb-6 text-center">Hierarki Chomsky</h2>
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          {[
            { level: "Tipe 0", name: "Unrestricted Grammar", color: "border-red-500/30 bg-red-500/5 text-red-400", width: "w-full" },
            { level: "Tipe 1", name: "Context-Sensitive Grammar", color: "border-orange-500/30 bg-orange-500/5 text-orange-400", width: "w-5/6" },
            { level: "Tipe 2", name: "Context-Free Grammar (PDA)", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400", width: "w-4/6" },
            { level: "Tipe 3", name: "Regular Grammar (FSA)", color: "border-blue-500/30 bg-blue-500/5 text-blue-400", width: "w-3/6" },
          ].map((item, idx) => (
            <div key={idx} className={`${item.width} ${item.color} border rounded-xl px-4 py-3 text-center transition-all hover:scale-[1.02]`}>
              <span className="font-bold text-xs">{item.level}</span>
              <span className="text-xs ml-2 opacity-70">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
