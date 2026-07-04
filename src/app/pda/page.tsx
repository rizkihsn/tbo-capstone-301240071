"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Database, Play, CheckCircle2, XCircle, SkipForward, RotateCcw, ArrowDown, ArrowUp } from 'lucide-react';
import { DPDA, EPSILON, PDAHistoryNode } from '@/services/pda/PDA';
import GraphVisualizer from '@/components/fsa/GraphVisualizer';

export default function PDAPage() {
  const [inputString, setInputString] = useState("");
  const [testResult, setTestResult] = useState<{ accepted: boolean; history: PDAHistoryNode[] } | null>(null);
  const [historyData, setHistoryData] = useState<PDAHistoryNode[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [stackAction, setStackAction] = useState<"push" | "pop" | "idle">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Definisi DPDA untuk bahasa 0^n 1^n (Jumlah 0 dan 1 sama)
  const defaultStates = ["q0", "q1", "q2"];
  const defaultInputAlphabet = ["0", "1"];
  const defaultStackAlphabet = ["A", "Z"];
  const defaultStartState = "q0";
  const defaultInitialStackSymbol = "Z";
  const defaultFinalStates = ["q2"];
  const defaultTransitions = [
    { from: "q0", to: "q0", input: "0", pop: "Z", push: ["A", "Z"] },
    { from: "q0", to: "q0", input: "0", pop: "A", push: ["A", "A"] },
    { from: "q0", to: "q1", input: "1", pop: "A", push: [EPSILON] },
    { from: "q1", to: "q1", input: "1", pop: "A", push: [EPSILON] },
    { from: "q1", to: "q2", input: EPSILON, pop: "Z", push: ["Z"] },
  ];

  // Deteksi push/pop berdasarkan perubahan stack
  useEffect(() => {
    if (historyData.length === 0 || currentStep === 0) {
      setStackAction("idle");
      return;
    }
    const prev = historyData[currentStep - 1]?.stack || [];
    const curr = historyData[currentStep]?.stack || [];
    setPrevStack(prev);
    if (curr.length > prev.length) {
      setStackAction("push");
    } else if (curr.length < prev.length) {
      setStackAction("pop");
    } else {
      setStackAction("idle");
    }
    const timer = setTimeout(() => setStackAction("idle"), 600);
    return () => clearTimeout(timer);
  }, [currentStep, historyData]);

  const handleTestString = () => {
    if (isSimulating) return;
    
    setTestResult(null);
    setHistoryData([]);
    setCurrentStep(0);
    setIsSimulating(true);
    setStackAction("idle");

    const dpda = new DPDA(
      defaultStates, defaultInputAlphabet, defaultStackAlphabet,
      defaultTransitions, defaultStartState, defaultInitialStackSymbol, defaultFinalStates
    );

    const result = dpda.evaluate(inputString);
    const history = result.history;
    setHistoryData(history);
    
    let step = 0;
    intervalRef.current = setInterval(() => {
      if (step < history.length - 1) {
        step++;
        setCurrentStep(step);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTestResult(result);
        setIsSimulating(false);
      }
    }, 1200);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTestResult(null);
    setHistoryData([]);
    setCurrentStep(0);
    setIsSimulating(false);
    setStackAction("idle");
  };

  // Format data untuk GraphVisualizer
  const visualizerTransitions = defaultTransitions.map((t) => ({
    from: t.from,
    to: t.to,
    symbol: `${t.input}, ${t.pop} → ${t.push.join('')}`
  }));

  const activeHistoryNode = historyData.length > 0 ? historyData[currentStep] : null;
  const activeState = activeHistoryNode ? [activeHistoryNode.state] : [];
  const activeStack = activeHistoryNode ? activeHistoryNode.stack : [defaultInitialStackSymbol];

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <Database className="text-cyan-500" />
            Pushdown Automata
          </h1>
          <p className="text-slate-400 mt-1">Simulasi mesin state yang dilengkapi dengan Memori Stack tak terbatas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Panel Kiri - Kontrol */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Definisi PDA</h3>
            <p className="text-xs text-slate-400 mb-4">
              Bahasa <strong>0<sup>n</sup>1<sup>n</sup></strong>. Menerima string yang jumlah digit 0 dan 1-nya sama persis (misal: 0011).
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">States (Q)</label>
                <input type="text" value={defaultStates.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stack Alphabet (Γ)</label>
                <input type="text" value={defaultStackAlphabet.join(', ')} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initial Stack Symbol</label>
                <input type="text" value={defaultInitialStackSymbol} disabled className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-bold text-white mb-3">Uji String</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Misal: 000111"
                disabled={isSimulating}
                className="flex-1 bg-slate-900/80 border border-cyan-500/30 focus:border-cyan-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors disabled:opacity-50"
              />
              <button 
                onClick={handleTestString}
                disabled={isSimulating || inputString.length === 0}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-cyan-500/20"
              >
                <Play size={18} fill="currentColor" />
              </button>
              {(isSimulating || historyData.length > 0) && (
                <button 
                  onClick={handleReset}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              )}
            </div>
            
            <div className="mt-4">
              {isSimulating ? (
                <div className="text-xs text-cyan-400 text-center p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 animate-pulse">
                  Mensimulasikan Stack...
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
                  Masukkan string (misal: 0011)
                </div>
              )}
            </div>
          </div>

          {/* Input Tape Visualization */}
          {historyData.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-bold text-white mb-3">Input Tape</h3>
              <div className="flex gap-1 flex-wrap">
                {inputString.split('').map((char, idx) => {
                  const consumed = activeHistoryNode ? activeHistoryNode.inputConsumed : 0;
                  const isCurrent = idx === consumed && consumed < inputString.length;
                  const isRead = idx < consumed;
                  return (
                    <div 
                      key={idx}
                      className={`w-9 h-9 flex items-center justify-center font-mono font-bold text-sm rounded-lg border-2 transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110 shadow-lg shadow-cyan-500/30' 
                          : isRead 
                            ? 'bg-slate-800 border-slate-600 text-slate-500' 
                            : 'bg-slate-900/50 border-slate-700 text-slate-300'
                      }`}
                    >
                      {char}
                    </div>
                  );
                })}
                {inputString.length === 0 && (
                  <div className="text-xs text-slate-500 italic">ε (string kosong)</div>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Dibaca: {activeHistoryNode?.inputConsumed || 0} / {inputString.length}
              </div>
            </div>
          )}

          {/* Computation Log */}
          {historyData.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-bold text-white mb-3">Log Komputasi</h3>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {historyData.map((node, idx) => {
                  const isActive = idx === currentStep;
                  const isPast = idx < currentStep;
                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded-lg text-xs transition-all duration-300 ${
                        isActive 
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' 
                          : isPast
                            ? 'bg-slate-900/30 text-slate-500 border border-transparent'
                            : 'bg-slate-900/20 text-slate-600 border border-transparent opacity-50'
                      }`}
                    >
                      <span className="font-bold">{idx}.</span> {node.action}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panel Kanan - Visualisasi Graf & Memori Stack */}
        <div className="lg:col-span-3 grid grid-cols-4 gap-6">
          {/* Visualisasi Graf */}
          <div className="col-span-3 glass-panel rounded-2xl flex flex-col relative overflow-hidden bg-slate-900/30">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <span className="px-3 py-1 text-xs font-bold border rounded-full bg-cyan-500/20 text-cyan-400 border-cyan-500/20 w-fit">
                State Machine
              </span>
              {activeHistoryNode && (
                <div className="bg-slate-800/80 border border-white/10 rounded-lg p-2 text-xs text-slate-300 backdrop-blur max-w-[280px]">
                  <div className="text-slate-500 mb-1">Langkah {currentStep} / {historyData.length - 1}</div>
                  Log: <span className="font-bold text-white">{activeHistoryNode.action}</span>
                </div>
              )}
            </div>
            
            <GraphVisualizer 
              states={defaultStates}
              transitions={visualizerTransitions}
              startState={defaultStartState}
              finalStates={defaultFinalStates}
              activeStates={activeState}
            />
          </div>

          {/* Visualisasi Memory Stack (LIFO) */}
          <div className="col-span-1 glass-panel rounded-2xl p-4 flex flex-col items-center">
            <h3 className="text-sm font-bold text-cyan-400 mb-2 w-full text-center border-b border-white/10 pb-2">
              Memory Stack
            </h3>

            {/* Push/Pop Indicator */}
            <div className="h-8 flex items-center justify-center w-full mb-1">
              {stackAction === "push" && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 animate-bounce">
                  <ArrowDown size={14} />
                  PUSH
                </div>
              )}
              {stackAction === "pop" && (
                <div className="flex items-center gap-1 text-xs font-bold text-red-400 animate-bounce">
                  <ArrowUp size={14} />
                  POP
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full flex flex-col justify-end items-center gap-1 overflow-hidden relative">
              {activeStack.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs italic">
                  (Kosong)
                </div>
              )}
              
              {/* Stack terbalik: index terakhir = top of stack */}
              {[...activeStack].reverse().map((symbol: string, idx: number) => {
                const isTop = idx === 0;
                const reverseIdx = activeStack.length - 1 - idx;
                return (
                  <div 
                    key={`${symbol}-${reverseIdx}-${currentStep}`}
                    className={`w-20 h-10 flex items-center justify-center font-bold rounded-md shadow-md transition-all duration-500 ${
                      isTop 
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white scale-110 mb-1 shadow-cyan-500/50 z-10 border-2 border-cyan-300/50' 
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                    } ${
                      stackAction === "push" && isTop ? 'animate-slide-in-top' : ''
                    }`}
                    style={{
                      animationDuration: '0.4s',
                    }}
                  >
                    {symbol}
                  </div>
                );
              })}
              
              {/* Dasar Stack */}
              <div className="w-24 h-2 mt-2 bg-slate-600 rounded-full shrink-0"></div>
            </div>
            
            <div className="mt-3 text-xs text-slate-400 text-center">
              <div>Depth: <span className="font-bold text-white">{activeStack.length}</span></div>
              <div className="mt-1">Top: <span className="text-cyan-400 font-bold">{activeStack.length > 0 ? activeStack[activeStack.length - 1] : '∅'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
