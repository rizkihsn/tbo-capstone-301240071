"use client";

import React, { useState, useMemo } from 'react';
import { Play, Settings2, GitCommit, CheckCircle2, ArrowRight } from 'lucide-react';
import { MooreMachine, MealyMachine } from '@/services/fsa/Transducer';
import GraphVisualizer from '@/components/fsa/GraphVisualizer';

export default function TransducerPage() {
  const [inputString, setInputString] = useState("");
  const [testResult, setTestResult] = useState<{ outputString: string; path: string[] } | null>(null);
  
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState<"Moore" | "Mealy">("Moore");

  // Definisi Moore Machine (Contoh: Menghitung sisa pembagian 3 dari bilangan biner)
  const mooreData = {
    states: ["q0", "q1", "q2"],
    inputAlphabet: ["0", "1"],
    outputAlphabet: ["0", "1", "2"],
    startState: "q0",
    stateOutputs: {
      "q0": "0", // Sisa 0
      "q1": "1", // Sisa 1
      "q2": "2", // Sisa 2
    },
    transitions: [
      { from: "q0", to: "q0", symbol: "0" },
      { from: "q0", to: "q1", symbol: "1" },
      { from: "q1", to: "q2", symbol: "0" },
      { from: "q1", to: "q0", symbol: "1" },
      { from: "q2", to: "q1", symbol: "0" },
      { from: "q2", to: "q2", symbol: "1" },
    ]
  };

  // Definisi Mealy Machine (Contoh: 1's Complement dari bilangan biner)
  const mealyData = {
    states: ["q0"],
    inputAlphabet: ["0", "1"],
    outputAlphabet: ["0", "1"],
    startState: "q0",
    transitions: [
      { from: "q0", to: "q0", symbol: "0", output: "1" },
      { from: "q0", to: "q0", symbol: "1", output: "0" },
    ]
  };

  const handleTestString = () => {
    if (isSimulating) return;
    
    setActiveStates([]);
    setTestResult(null);
    setIsSimulating(true);

    let step = 0;
    
    if (mode === "Moore") {
      const moore = new MooreMachine(
        mooreData.states, mooreData.inputAlphabet, mooreData.outputAlphabet, 
        mooreData.transitions, mooreData.startState, mooreData.stateOutputs
      );
      const result = moore.evaluate(inputString);
      const path = result.path;
      
      const interval = setInterval(() => {
        if (step < path.length) {
          setActiveStates([path[step]]);
          step++;
        } else {
          clearInterval(interval);
          setTestResult(result);
          setIsSimulating(false);
        }
      }, 800);
    } else {
      const mealy = new MealyMachine(
        mealyData.states, mealyData.inputAlphabet, mealyData.outputAlphabet, 
        mealyData.transitions, mealyData.startState
      );
      const result = mealy.evaluate(inputString);
      const path = result.path;
      
      const interval = setInterval(() => {
        if (step < path.length) {
          setActiveStates([path[step]]);
          step++;
        } else {
          clearInterval(interval);
          setTestResult(result);
          setIsSimulating(false);
        }
      }, 800);
    }
  };

  const toggleMode = () => {
    setMode(mode === "Moore" ? "Mealy" : "Moore");
    setTestResult(null);
    setActiveStates([]);
  };

  // Persiapkan data untuk GraphVisualizer
  const visualizerData = useMemo(() => {
    if (mode === "Moore") {
      const labels: Record<string, string> = {};
      mooreData.states.forEach(s => {
        labels[s] = `${s}/${mooreData.stateOutputs[s as keyof typeof mooreData.stateOutputs]}`;
      });
      return {
        states: mooreData.states,
        transitions: mooreData.transitions,
        startState: mooreData.startState,
        finalStates: [], // Tidak ada final state
        stateLabels: labels
      };
    } else {
      // Mealy
      const mappedTransitions = mealyData.transitions.map(t => ({
        from: t.from,
        to: t.to,
        symbol: `${t.symbol}/${t.output}`
      }));
      return {
        states: mealyData.states,
        transitions: mappedTransitions,
        startState: mealyData.startState,
        finalStates: [], // Tidak ada final state
      };
    }
  }, [mode]);
  
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <GitCommit className={mode === "Moore" ? "text-orange-500" : "text-amber-500"} />
            Mesin {mode} (Transducer)
          </h1>
          <p className="text-slate-400 mt-1">Simulasi Finite State Transducer yang menghasilkan output.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleMode}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-lg transition-all shadow-lg"
          >
            Beralih ke {mode === "Moore" ? "Mealy" : "Moore"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Panel Kiri - Kontrol */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Definisi Mesin</h3>
            <p className="text-xs text-slate-400 mb-4">
              {mode === "Moore" 
                ? "Contoh ini menghitung Modulo 3 dari input biner. Output menempel pada State (q/Output)."
                : "Contoh ini mengubah biner ke 1's Complement. Output menempel pada Transisi (Input/Output)."
              }
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">States (Q)</label>
                <input type="text" value={visualizerData.states.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Input Alphabet (Σ)</label>
                <input type="text" value="0, 1" disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Output Alphabet (Γ)</label>
                <input type="text" value={mode === "Moore" ? "0, 1, 2" : "0, 1"} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Uji String</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Misal: 1011"
                disabled={isSimulating}
                className="flex-1 bg-slate-900/80 border-orange-500/30 focus:border-orange-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors disabled:opacity-50"
              />
              <button 
                onClick={handleTestString}
                disabled={isSimulating || inputString.length === 0}
                className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
            
            <div className="mt-4 h-16">
              {isSimulating ? (
                <div className="text-xs text-orange-400 text-center p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 animate-pulse">
                  Menghasilkan output...
                </div>
              ) : testResult ? (
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-xs text-slate-400 mb-1">Hasil Output:</span>
                  <span className="text-lg font-bold text-emerald-400 tracking-wider">
                    {testResult.outputString}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center p-2 rounded-lg bg-slate-900/50 border border-white/5">
                  Masukkan string untuk melihat output
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Kanan - Visualisasi */}
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-3 py-1 text-xs font-bold border rounded-full bg-orange-500/20 text-orange-400 border-orange-500/20">
              {mode} Machine
            </span>
          </div>
          
          <GraphVisualizer 
            states={visualizerData.states}
            transitions={visualizerData.transitions}
            startState={visualizerData.startState}
            finalStates={visualizerData.finalStates}
            activeStates={activeStates}
            stateLabels={visualizerData.stateLabels}
          />
        </div>
      </div>
    </div>
  );
}
