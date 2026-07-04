"use client";

import React, { useState } from 'react';
import { Play, Settings2, Network, CheckCircle2, XCircle } from 'lucide-react';
import { NFA, NFAHistoryNode } from '@/services/fsa/NFA';
import { DFA, FSAHistoryNode } from '@/services/fsa/DFA';
import { FSAConverter } from '@/services/fsa/Converter';
import GraphVisualizer from '@/components/fsa/GraphVisualizer';

export default function FSAPage() {
  const [inputString, setInputString] = useState("");
  const [testResult, setTestResult] = useState<{ accepted: boolean; pathHistory?: string[][], path?: string[], history?: (FSAHistoryNode | NFAHistoryNode)[] } | null>(null);
  
  // State untuk graf
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<(FSAHistoryNode | NFAHistoryNode)[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState<"DFA" | "NFA">("NFA");

  const [fsaData, setFsaData] = useState({
    states: ["q0", "q1", "q2"],
    alphabet: ["0", "1"],
    startState: "q0",
    finalStates: ["q2"],
    transitions: [
      { from: "q0", to: "q0", symbol: "0" },
      { from: "q0", to: "q0", symbol: "1" }, 
      { from: "q0", to: "q1", symbol: "1" }, 
      { from: "q1", to: "q2", symbol: "1" },
    ]
  });

  const handleTestString = () => {
    if (isSimulating) return;
    
    setActiveStates([]);
    setTestResult(null);
    setIsSimulating(true);

    let step = 0;
    
    if (mode === "NFA") {
      const nfa = new NFA(fsaData.states, fsaData.alphabet, fsaData.transitions, fsaData.startState, fsaData.finalStates);
      const result = nfa.evaluate(inputString);
      const history = result.history;
      setHistoryData(history);
      
      const interval = setInterval(() => {
        if (step < history.length) {
          setActiveStates(history[step].activeStates as string[]);
          setCurrentStep(step);
          step++;
        } else {
          clearInterval(interval);
          setTestResult(result);
          setIsSimulating(false);
        }
      }, 1000);
    } else {
      const dfa = new DFA(fsaData.states, fsaData.alphabet, fsaData.transitions, fsaData.startState, fsaData.finalStates);
      const result = dfa.evaluate(inputString);
      const history = result.history;
      setHistoryData(history);
      
      const interval = setInterval(() => {
        if (step < history.length) {
          setActiveStates([history[step].state as string]);
          setCurrentStep(step);
          step++;
        } else {
          clearInterval(interval);
          setTestResult(result);
          setIsSimulating(false);
        }
      }, 800);
    }
  };

  const handleConvertToDfa = () => {
    const nfa = new NFA(fsaData.states, fsaData.alphabet, fsaData.transitions, fsaData.startState, fsaData.finalStates);
    const dfa = FSAConverter.nfaToDfa(nfa);
    
    setFsaData({
      states: Array.from(dfa.states),
      alphabet: Array.from(dfa.alphabet),
      startState: dfa.startState,
      finalStates: Array.from(dfa.finalStates),
      transitions: dfa.transitions
    });
    setMode("DFA");
    setActiveStates([]);
    setTestResult(null);
  };
  
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <Network className={mode === "NFA" ? "text-purple-500" : "text-blue-500"} />
            Finite State Automata
          </h1>
          <p className="text-slate-400 mt-1">Desain dan simulasikan DFA / NFA.</p>
        </div>
        
        <div className="flex gap-3">
          {mode === "NFA" && (
            <button 
              onClick={handleConvertToDfa}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg border border-purple-500 transition-colors shadow-lg shadow-purple-500/20 font-bold"
            >
              Konversi ke DFA
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors">
            <Settings2 size={18} />
            Konfigurasi (Coming Soon)
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Panel Kiri - Kontrol & Definisi */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Definisi 5-Tuple ({mode})</h3>
            <p className="text-xs text-slate-400 mb-4">Mesin ini menerima string yang berakhiran &apos;11&apos;.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">States (Q)</label>
                <input type="text" value={fsaData.states.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 overflow-hidden text-ellipsis" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Alphabet (Σ)</label>
                <input type="text" value={fsaData.alphabet.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Start State (q0)</label>
                <input type="text" value={fsaData.startState} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 overflow-hidden text-ellipsis" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Final States (F)</label>
                <input type="text" value={fsaData.finalStates.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 overflow-hidden text-ellipsis" />
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
                className="flex-1 bg-slate-900/80 border border-blue-500/30 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors disabled:opacity-50"
              />
              <button 
                onClick={handleTestString}
                disabled={isSimulating || inputString.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
            
            <div className="mt-4 h-12">
              {isSimulating ? (
                <div className="text-xs text-blue-400 text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 animate-pulse">
                  Mensimulasikan...
                </div>
              ) : testResult ? (
                <div className={`text-sm font-bold text-center p-2 rounded-lg border flex items-center justify-center gap-2 ${
                  testResult.accepted 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {testResult.accepted ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {testResult.accepted ? 'Accepted' : 'Rejected'}
                </div>
              ) : (
                <div className="text-xs text-slate-400 text-center p-2 rounded-lg bg-slate-900/50 border border-white/5">
                  Masukkan string untuk diuji
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Kanan - Visualisasi */}
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span className={`px-3 py-1 text-xs font-bold border rounded-full w-fit ${
              mode === "NFA" 
                ? "bg-purple-500/20 text-purple-400 border-purple-500/20" 
                : "bg-blue-500/20 text-blue-400 border-blue-500/20"
            }`}>
              {mode} Mode
            </span>
            {historyData.length > 0 && currentStep >= 0 && currentStep < historyData.length && (
              <div className="bg-slate-800/80 border border-white/10 rounded-lg p-2 text-xs text-slate-300 backdrop-blur max-w-[300px]">
                <div className="text-slate-500 mb-1">Langkah {currentStep + 1} / {historyData.length}</div>
                Log: <span className="font-bold text-white">{historyData[currentStep].action}</span>
              </div>
            )}
          </div>
          
          <GraphVisualizer 
            states={fsaData.states}
            transitions={fsaData.transitions}
            startState={fsaData.startState}
            finalStates={fsaData.finalStates}
            activeStates={activeStates}
          />
        </div>
      </div>
    </div>
  );
}
