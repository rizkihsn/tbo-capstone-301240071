"use client";

import React, { useState, useMemo } from 'react';
import { Type, Code2, Play, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { CFG, generateExampleParseTree, EPSILON, ProductionRule } from '@/services/cfg/CFG';
import { CNFConverter, CNFConversionStep } from '@/services/cfg/CNFConverter';
import ParseTreeVisualizer from '@/components/cfg/ParseTreeVisualizer';

// Komponen untuk menampilkan aturan produksi dengan warna
const RuleDisplay = ({ rules, variables }: { rules: ProductionRule[], variables: string[] }) => {
  const grouped = new Map<string, string[][]>();
  for (const rule of rules) {
    if (!grouped.has(rule.left)) {
      grouped.set(rule.left, []);
    }
    grouped.get(rule.left)!.push(rule.right.length === 0 ? [EPSILON] : rule.right);
  }

  return (
    <div className="space-y-2 font-mono text-sm">
      {Array.from(grouped.entries()).map(([left, rights]) => (
        <div key={left} className="flex items-start gap-2">
          <span className="text-pink-400 font-bold shrink-0">{left}</span>
          <span className="text-slate-500">→</span>
          <span className="text-emerald-300 break-all">
            {rights.map((r, i) => (
              <span key={i}>
                {i > 0 && <span className="text-orange-400 mx-1">|</span>}
                {r.map((sym, j) => (
                  <span key={j} className={variables.includes(sym) ? "text-pink-400" : "text-emerald-300"}>
                    {sym}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CFGPage() {
  const [activeTab, setActiveTab] = useState<"ParseTree" | "CNF">("ParseTree");
  const [cnfSteps, setCnfSteps] = useState<CNFConversionStep[] | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [cnfResult, setCnfResult] = useState<CFG | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Definisi CFG yang lebih kaya untuk demo konversi CNF
  // S → ASB | ε
  // A → aAS | a
  // B → SbS | A | bb
  const demoCfg = useMemo(() => new CFG(
    ["S", "A", "B"],
    ["a", "b"],
    [
      { left: "S", right: ["A", "S", "B"] },
      { left: "S", right: [] },               // S → ε
      { left: "A", right: ["a", "A", "S"] },
      { left: "A", right: ["a"] },
      { left: "B", right: ["S", "b", "S"] },
      { left: "B", right: ["A"] },             // Unit production!
      { left: "B", right: ["b", "b"] },
    ],
    "S"
  ), []);

  // CFG sederhana untuk Parse Tree
  const simpleTreeCfg = useMemo(() => new CFG(
    ["S"],
    ["a", "b"],
    [
      { left: "S", right: ["a", "S", "b"] },
      { left: "S", right: [] }
    ],
    "S"
  ), []);

  const exampleTree = useMemo(() => generateExampleParseTree(), []);

  const handleConvertCNF = () => {
    setErrorMsg("");
    try {
      // Trigger validation (which might throw)
      const testCfg = new CFG(
        Array.from(demoCfg.variables), 
        Array.from(demoCfg.terminals), 
        demoCfg.rules, 
        demoCfg.startVariable
      );
      
      const converter = new CNFConverter();
      const { result, steps } = converter.convert(testCfg);
      setCnfSteps(steps);
      setCnfResult(result);
      setCurrentStepIdx(0);
      setActiveTab("CNF");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Terjadi kesalahan saat mengonversi ke CNF.");
      }
    }
  };

  const currentStep = cnfSteps ? cnfSteps[currentStepIdx] : null;
  const activeCfg = activeTab === "ParseTree" ? simpleTreeCfg : demoCfg;

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <Type className="text-emerald-500" />
            Context-Free Grammar
          </h1>
          <p className="text-slate-400 mt-1">Tata bahasa bebas konteks, Parse Tree, dan konversi ke CNF.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleConvertCNF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 font-bold"
          >
            <ArrowRight size={16} />
            Konversi ke CNF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Panel Kiri - Definisi & Aturan */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              {activeTab === "ParseTree" ? "CFG Sederhana" : "CFG untuk Konversi"}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {activeTab === "ParseTree" 
                ? <>Bahasa <strong>a^n b^n</strong>. Parse Tree untuk string &quot;aabb&quot;.</>
                : <>CFG lengkap dengan ε-production, unit production, dan aturan panjang. Cocok untuk demo konversi CNF.</>
              }
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Variabel (V)</label>
                <input type="text" value={Array.from(activeCfg.variables).join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Terminal (Σ)</label>
                <input type="text" value={Array.from(activeCfg.terminals).join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Code2 size={16} className="text-emerald-400" />
              Production Rules (R)
            </h3>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20 font-mono text-sm text-emerald-300 whitespace-pre-line">
              {activeCfg.toString()}
            </div>
            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel Kanan - Visualisasi */}
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button 
              onClick={() => setActiveTab("ParseTree")}
              className={`px-4 py-1.5 text-xs font-bold border rounded-l-full transition-colors ${
                activeTab === "ParseTree" 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              }`}
            >
              Parse Tree (D3.js)
            </button>
            <button 
              onClick={() => { if (cnfSteps) setActiveTab("CNF"); }}
              className={`px-4 py-1.5 text-xs font-bold border rounded-r-full transition-colors -ml-2 ${
                activeTab === "CNF" 
                  ? "bg-teal-500/20 text-teal-400 border-teal-500/30" 
                  : cnfSteps 
                    ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    : "bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed"
              }`}
            >
              CNF Konversi
            </button>
          </div>
          
          {/* ===== Parse Tree View ===== */}
          {activeTab === "ParseTree" && (
            <div className="flex-1 mt-14 flex flex-col items-center justify-center p-4">
              <div className="text-xs text-slate-400 mb-4 bg-slate-800/50 px-3 py-1 rounded-full backdrop-blur border border-white/5">
                Pohon Penurunan (Derivation Tree) untuk string: <strong>aabb</strong>
              </div>
              <div className="w-full flex-1 border-2 border-dashed border-white/5 rounded-xl bg-slate-950/30 relative">
                <ParseTreeVisualizer data={exampleTree} />
              </div>
            </div>
          )}

          {/* ===== CNF Conversion Step-by-Step View ===== */}
          {activeTab === "CNF" && cnfSteps && currentStep && (
            <div className="flex-1 mt-14 flex flex-col p-6 gap-4 overflow-auto">
              {/* Step Header & Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentStep.stepName}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">{currentStep.description}</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => setCurrentStepIdx(Math.max(0, currentStepIdx - 1))}
                    disabled={currentStepIdx === 0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors border border-white/10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-slate-400 font-bold w-16 text-center">
                    {currentStepIdx + 1} / {cnfSteps.length}
                  </span>
                  <button 
                    onClick={() => setCurrentStepIdx(Math.min(cnfSteps.length - 1, currentStepIdx + 1))}
                    disabled={currentStepIdx === cnfSteps.length - 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors border border-white/10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStepIdx + 1) / cnfSteps.length) * 100}%` }}
                />
              </div>

              {/* Step Dots */}
              <div className="flex justify-center gap-2 mb-2">
                {cnfSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      idx === currentStepIdx 
                        ? 'bg-teal-500/20 text-teal-400 border-teal-500/40 font-bold scale-105' 
                        : idx < currentStepIdx 
                          ? 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {step.stepName.split('.')[0]}
                  </button>
                ))}
              </div>

              {/* Rules Display */}
              <div className="flex-1 bg-slate-950/50 rounded-xl border border-white/5 p-5 overflow-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Variabel: <span className="text-pink-400 font-bold">{currentStep.variables.join(', ')}</span>
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Total Aturan: <span className="text-white font-bold">{currentStep.rules.length}</span>
                  </span>
                </div>
                <RuleDisplay rules={currentStep.rules} variables={currentStep.variables} />
              </div>

              {/* Final Result Badge */}
              {currentStepIdx === cnfSteps.length - 1 && cnfResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <span className="text-emerald-400 font-bold text-sm">
                    ✅ Konversi ke Chomsky Normal Form Selesai!
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Semua aturan kini berbentuk A → BC atau A → a (atau S₀ → ε).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
