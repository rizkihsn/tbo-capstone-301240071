"use client";

import React, { useState } from 'react';
import { Regex as RegexIcon, Play, AlertCircle, Network, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { RegexParser, ASTNode, LiteralNode, ConcatNode, UnionNode, StarNode } from '@/services/regex/RegexParser';
import { ThompsonConstruction } from '@/services/regex/Thompson';
import { NFA } from '@/services/fsa/NFA';
import GraphVisualizer from '@/components/fsa/GraphVisualizer';

// Komponen rekursif untuk menampilkan AST dalam bentuk Tree UI sederhana
const ASTViewer = ({ node }: { node: ASTNode | null }) => {
  if (!node) return null;

  if (node instanceof LiteralNode) {
    return (
      <div className="inline-flex items-center justify-center px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono font-bold mx-1">
        {node.value}
      </div>
    );
  }

  if (node instanceof StarNode) {
    return (
      <div className="flex flex-col items-center p-2 m-1 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <div className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-1">
          KLEENE STAR (*)
        </div>
        <div className="border-t border-purple-500/20 w-full mb-2"></div>
        <ASTViewer node={node.child} />
      </div>
    );
  }

  if (node instanceof ConcatNode) {
    return (
      <div className="flex flex-col items-center p-2 m-1 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="text-xs font-bold text-blue-400 mb-1">CONCATENATION (•)</div>
        <div className="border-t border-blue-500/20 w-full mb-2"></div>
        <div className="flex gap-2 items-start">
          <ASTViewer node={node.left} />
          <ASTViewer node={node.right} />
        </div>
      </div>
    );
  }

  if (node instanceof UnionNode) {
    return (
      <div className="flex flex-col items-center p-2 m-1 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <div className="text-xs font-bold text-orange-400 mb-1">UNION (|)</div>
        <div className="border-t border-orange-500/20 w-full mb-2"></div>
        <div className="flex gap-2 items-start relative">
          <ASTViewer node={node.left} />
          <div className="flex items-center justify-center text-orange-500/50 font-bold px-1">OR</div>
          <ASTViewer node={node.right} />
        </div>
      </div>
    );
  }

  return null;
};

interface TestHistoryEntry {
  testString: string;
  accepted: boolean;
  regex: string;
  timestamp: Date;
}

export default function RegexPage() {
  const [regexInput, setRegexInput] = useState("a(b|c)*");
  const [astRoot, setAstRoot] = useState<ASTNode | null>(null);
  const [generatedNFA, setGeneratedNFA] = useState<NFA | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"AST" | "NFA">("AST");
  
  // Fase 3 state baru
  const [testString, setTestString] = useState("");
  const [testResult, setTestResult] = useState<{ accepted: boolean; matchedChars: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);

  const handleParse = () => {
    setErrorMsg("");
    setAstRoot(null);
    setGeneratedNFA(null);
    setTestResult(null);
    setActiveStates([]);
    setCurrentStep(-1);
    try {
      if (!regexInput.trim()) {
        setErrorMsg("Ekspresi reguler tidak boleh kosong.");
        return;
      }

      // Validasi pola regex sebelum parsing
      let openParens = 0;
      for (let i = 0; i < regexInput.length; i++) {
        if (regexInput[i] === '(') openParens++;
        if (regexInput[i] === ')') openParens--;
        if (openParens < 0) {
          setErrorMsg(`Tanda kurung tutup ')' tanpa pasangannya pada posisi ${i + 1}.`);
          return;
        }
        // Cek * di awal atau setelah operator lain
        if (regexInput[i] === '*' && (i === 0 || regexInput[i - 1] === '(' || regexInput[i - 1] === '|')) {
          setErrorMsg(`Operator '*' tidak valid pada posisi ${i + 1}. Operator harus mengikuti operand.`);
          return;
        }
        // Cek | di awal / akhir
        if (regexInput[i] === '|' && (i === 0 || i === regexInput.length - 1)) {
          setErrorMsg(`Operator '|' tidak valid pada posisi ${i + 1}. Harus diapit oleh operand.`);
          return;
        }
      }
      if (openParens > 0) {
        setErrorMsg(`Terdapat ${openParens} tanda kurung buka '(' yang tidak ditutup.`);
        return;
      }

      const parser = new RegexParser();
      const ast = parser.parse(regexInput);
      setAstRoot(ast);
      
      if (ast) {
        const nfa = ThompsonConstruction.astToNFA(ast);
        setGeneratedNFA(nfa);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Terjadi kesalahan saat memparsing regex.");
      }
    }
  };

  const handleTestString = () => {
    if (!generatedNFA || isSimulating) return;

    setTestResult(null);
    setActiveStates([]);
    setCurrentStep(-1);
    setIsSimulating(true);
    setActiveTab("NFA");

    const result = generatedNFA.evaluate(testString);
    const history = result.history;

    let step = 0;
    const interval = setInterval(() => {
      if (step < history.length) {
        setActiveStates(history[step].activeStates);
        setCurrentStep(step);
        step++;
      } else {
        clearInterval(interval);
        setTestResult({ accepted: result.accepted, matchedChars: testString.length });
        setIsSimulating(false);

        // Tambah ke riwayat
        setTestHistory(prev => [
          { testString, accepted: result.accepted, regex: regexInput, timestamp: new Date() },
          ...prev.slice(0, 9) // Keep last 10
        ]);
      }
    }, 600);
  };

  const clearHistory = () => setTestHistory([]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <RegexIcon className="text-pink-500" />
            Regular Expression
          </h1>
          <p className="text-slate-400 mt-1">Parsing Regex ke AST, konversi ke NFA, dan uji pencocokan string.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Panel Kiri - Kontrol */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Regex Parser Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Parser Regex</h3>
            <p className="text-xs text-slate-400 mb-3">
              Mendukung: <code className="bg-slate-800 px-1 rounded">*</code> (Star), <code className="bg-slate-800 px-1 rounded">|</code> (Union), <code className="bg-slate-800 px-1 rounded">()</code> (Grup). Concatenation implisit.
            </p>
            
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={regexInput}
                onChange={(e) => setRegexInput(e.target.value)}
                placeholder="Misal: a(b|c)*"
                className="w-full bg-slate-900/80 border border-pink-500/30 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors font-mono"
              />
              <button 
                onClick={handleParse}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 font-bold"
              >
                <Play size={16} fill="currentColor" />
                Parse ke AST & NFA
              </button>
            </div>
            
            {errorMsg && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Separator */}
          {generatedNFA && (
            <>
              <div className="border-t border-white/10" />

              {/* String Test Section */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Uji Pencocokan String</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Masukkan string untuk diuji terhadap regex <code className="bg-slate-800 px-1 rounded font-mono text-pink-300">{regexInput}</code>
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Misal: abcbc"
                    disabled={isSimulating}
                    className="flex-1 bg-slate-900/80 border border-pink-500/30 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white transition-colors disabled:opacity-50 font-mono"
                  />
                  <button 
                    onClick={handleTestString}
                    disabled={isSimulating}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-purple-500/20"
                  >
                    <Play size={18} fill="currentColor" />
                  </button>
                </div>

                {/* Result */}
                <div className="mt-3 h-auto">
                  {isSimulating ? (
                    <div className="text-xs text-pink-400 text-center p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 animate-pulse">
                      Mensimulasikan NFA...
                    </div>
                  ) : testResult ? (
                    <div>
                      <div className={`text-sm font-bold text-center p-2 rounded-lg border flex items-center justify-center gap-2 ${
                        testResult.accepted 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        {testResult.accepted ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {testResult.accepted ? 'Match' : 'No Match'}
                      </div>

                      {/* Highlight matched string */}
                      {testString && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-900/50 border border-white/5">
                          <div className="text-xs text-slate-500 mb-1">Input:</div>
                          <div className="font-mono text-sm tracking-wider">
                            {testString.split('').map((char, idx) => (
                              <span 
                                key={idx} 
                                className={`inline-block px-0.5 rounded ${
                                  testResult.accepted 
                                    ? 'text-emerald-400 bg-emerald-500/10' 
                                    : 'text-red-400 bg-red-500/10'
                                }`}
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* NFA Stats */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold text-white mb-3">Statistik NFA (Thompson)</h3>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between bg-slate-900/50 p-2 rounded-lg">
                    <span>Total State:</span>
                    <span className="font-bold text-white">{generatedNFA.states.size}</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/50 p-2 rounded-lg">
                    <span>Total Transisi:</span>
                    <span className="font-bold text-white">{generatedNFA.transitions.length}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Test History */}
          {testHistory.length > 0 && (
            <>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={14} />
                    Riwayat Pengujian
                  </h3>
                  <button onClick={clearHistory} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                  {testHistory.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 text-xs cursor-pointer hover:border-white/10 transition-colors"
                      onClick={() => {
                        setTestString(entry.testString);
                      }}
                    >
                      <span className="font-mono text-slate-300 truncate max-w-[120px]">
                        &quot;{entry.testString || 'ε'}&quot;
                      </span>
                      <span className={`font-bold ${entry.accepted ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.accepted ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Panel Kanan - Visualisasi */}
        <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex gap-0">
              <button 
                onClick={() => setActiveTab("AST")}
                className={`px-4 py-1 text-xs font-bold border rounded-l-full transition-colors ${
                  activeTab === "AST" 
                    ? "bg-pink-500/20 text-pink-400 border-pink-500/30" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                AST View
              </button>
              <button 
                onClick={() => setActiveTab("NFA")}
                className={`px-4 py-1 text-xs font-bold border rounded-r-full transition-colors -ml-px ${
                  activeTab === "NFA" 
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                NFA View
              </button>
            </div>

            {/* Step-by-step log saat simulasi */}
            {activeTab === "NFA" && currentStep >= 0 && generatedNFA && (
              <div className="bg-slate-800/80 border border-white/10 rounded-lg p-2 text-xs text-slate-300 backdrop-blur max-w-[320px]">
                <div className="text-slate-500 mb-1">
                  Langkah {currentStep + 1} — Simulasi NFA
                </div>
                <div className="font-bold text-white">
                  State aktif: [{activeStates.join(', ')}]
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-14 flex items-start justify-center overflow-auto p-4">
            {activeTab === "AST" && astRoot && (
              <ASTViewer node={astRoot} />
            )}
            
            {activeTab === "NFA" && generatedNFA && (
              <GraphVisualizer 
                states={Array.from(generatedNFA.states)}
                transitions={generatedNFA.transitions}
                startState={generatedNFA.startState}
                finalStates={Array.from(generatedNFA.finalStates)}
                activeStates={activeStates} 
              />
            )}

            {!astRoot && !generatedNFA && (
              <div className="text-center text-slate-500 self-center">
                <RegexIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada data.</p>
                <p className="text-sm">Klik tombol &quot;Parse ke AST & NFA&quot; untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
