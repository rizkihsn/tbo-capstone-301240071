import React, { useState } from 'react';
import { Layers, Play, Save, Plus, Trash2, ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/cards/Card';
import Button from '../../components/buttons/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const defaultTransitions = [
    { id: 1, from: 'q0', input: 'a', stackTop: 'Z0', toState: 'q0', pushSymbols: 'AZ0' },
    { id: 2, from: 'q0', input: 'a', stackTop: 'A', toState: 'q0', pushSymbols: 'AA' },
    { id: 3, from: 'q0', input: 'b', stackTop: 'A', toState: 'q1', pushSymbols: 'ε' },
    { id: 4, from: 'q1', input: 'b', stackTop: 'A', toState: 'q1', pushSymbols: 'ε' },
    { id: 5, from: 'q1', input: 'ε', stackTop: 'Z0', toState: 'q2', pushSymbols: 'Z0' },
];

export default function PDA() {
    const [inputAlphabet, setInputAlphabet] = useState('a, b');
    const [stackAlphabet, setStackAlphabet] = useState('A, Z0');
    const [testString, setTestString] = useState('aabb');
    const [acceptMode, setAcceptMode] = useState('empty_stack');
    const [transitions, setTransitions] = useState(defaultTransitions);
    const [stack, setStack] = useState(['Z0']);
    const [simResult, setSimResult] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const handleDeleteTransition = (id) => {
        setTransitions(t => t.filter(x => x.id !== id));
    };

    const handleAddTransition = () => {
        setTransitions(t => [...t, { id: Date.now(), from: 'q0', input: 'a', stackTop: 'Z0', toState: 'q0', pushSymbols: 'AZ0' }]);
    };

    const handleSimulate = () => {
        if (!testString.trim()) return;

        // Demo simulation: build a manual timeline for {a^n b^n} grammar
        const demoTimeline = [];
        const chars = testString.split('');
        let currentStack = ['Z0'];

        demoTimeline.push({ step: 0, state: 'q0', symbol: null, stackSnapshot: [...currentStack], action: 'Initial configuration' });

        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (ch === 'a') {
                currentStack = ['A', ...currentStack];
                demoTimeline.push({ step: i + 1, state: 'q0', symbol: ch, stackSnapshot: [...currentStack], action: `Push A → Stack: [${currentStack.join(', ')}]` });
            } else if (ch === 'b') {
                if (currentStack[0] === 'A') {
                    currentStack = currentStack.slice(1);
                    demoTimeline.push({ step: i + 1, state: 'q1', symbol: ch, stackSnapshot: [...currentStack], action: `Pop A → Stack: [${currentStack.join(', ')}]` });
                } else {
                    setSimResult({ accepted: false, reason: "Stack underflow — more b's than a's." });
                    setTimeline(demoTimeline);
                    setStack(currentStack);
                    setCurrentStep(demoTimeline.length - 1);
                    return;
                }
            }
        }

        const accepted = acceptMode === 'empty_stack'
            ? currentStack.length === 1 && currentStack[0] === 'Z0'
            : currentStack.length > 0;

        setSimResult({ accepted, reason: accepted ? 'Accepted — stack drained to Z₀.' : 'Rejected — stack not empty at end.' });
        setTimeline(demoTimeline);
        setStack(currentStack);
        setCurrentStep(demoTimeline.length - 1);
    };

    const handleReset = () => {
        setStack(['Z0']);
        setSimResult(null);
        setTimeline([]);
        setCurrentStep(0);
    };

    const displayStack = timeline.length > 0 && timeline[currentStep]
        ? timeline[currentStep].stackSnapshot
        : stack;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-background overflow-hidden">

            {/* Left Panel */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 border-r border-border bg-white dark:bg-card-dark overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-border sticky top-0 bg-white/95 dark:bg-card-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-base text-text-primary">PDA Simulator</h2>
                        <p className="text-xs text-text-secondary mt-0.5">Pushdown Automata & Stack Simulator</p>
                    </div>
                    <Button variant="ghost" size="icon" title="Save"><Save size={15} /></Button>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    <section>
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Formal Definition</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-1 block">Input Alphabet (Σ)</label>
                                <input value={inputAlphabet} onChange={e => setInputAlphabet(e.target.value)}
                                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-900 border border-border rounded-lg text-sm font-mono outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-1 block">Stack Alphabet (Γ)</label>
                                <input value={stackAlphabet} onChange={e => setStackAlphabet(e.target.value)}
                                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-900 border border-border rounded-lg text-sm font-mono outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-semibold text-text-secondary mb-1 block">Acceptance Mode</label>
                            <select
                                value={acceptMode}
                                onChange={e => setAcceptMode(e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-white dark:bg-slate-800 text-sm outline-none focus:border-primary transition-colors"
                            >
                                <option value="empty_stack">Accept by Empty Stack</option>
                                <option value="final_state">Accept by Final State</option>
                            </select>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Transitions (δ)</h3>
                            <Button variant="ghost" size="xs" onClick={handleAddTransition} startIcon={<Plus size={12} />}>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {transitions.map(t => (
                                <div key={t.id} className="flex items-center gap-2 p-2.5 border border-border rounded-xl bg-gray-50 dark:bg-slate-900/50 text-xs">
                                    <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-border font-semibold">({t.from}, {t.input}, {t.stackTop})</span>
                                        <ArrowRight size={12} className="text-text-secondary flex-shrink-0" />
                                        <span className="font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-border font-semibold">({t.toState}, {t.pushSymbols})</span>
                                    </div>
                                    <button onClick={() => handleDeleteTransition(t.id)} className="text-text-secondary hover:text-danger transition-colors flex-shrink-0">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-4 border-t border-border bg-gray-50 dark:bg-slate-900/30 space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Simulation</h3>
                    <input
                        value={testString}
                        onChange={e => setTestString(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSimulate()}
                        placeholder="Test string (e.g. aabb)"
                        className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-border rounded-lg font-mono text-sm outline-none focus:border-primary transition-colors"
                    />
                    <div className="flex gap-2">
                        <Button fullWidth onClick={handleSimulate} startIcon={<Play size={15} />}>Run Simulation</Button>
                        <Button variant="ghost" size="icon" onClick={handleReset} title="Reset"><RefreshCw size={15} /></Button>
                    </div>

                    <AnimatePresence>
                        {simResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl border text-sm font-semibold",
                                    simResult.accepted ? "bg-success/10 border-success/30 text-success" : "bg-danger/10 border-danger/30 text-danger"
                                )}
                            >
                                {simResult.accepted ? <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="mt-0.5 flex-shrink-0" />}
                                <div>
                                    <div>{simResult.accepted ? 'String Accepted ✓' : 'String Rejected ✗'}</div>
                                    <div className="text-xs font-normal opacity-75 mt-0.5">{simResult.reason}</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Right: Graph + Stack */}
            <main className="flex-1 flex flex-col relative bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">

                {/* Graph Placeholder */}
                <div className="flex-1 flex items-center justify-center border-b border-border">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Layers size={40} className="text-primary/60" />
                        </div>
                        <h3 className="text-base font-semibold text-text-primary mb-2">State Transition Graph</h3>
                        <p className="text-sm text-text-secondary max-w-xs">Interactive React Flow graph for PDA state transitions renders here.</p>
                    </div>
                </div>

                {/* Stack + Timeline */}
                <div className="h-56 bg-white dark:bg-card-dark flex gap-6 p-5 overflow-hidden flex-shrink-0">

                    {/* Stack Visualizer */}
                    <div className="relative w-32 flex flex-col justify-end items-center rounded-xl border-2 border-border bg-gray-50 dark:bg-slate-900/50 overflow-hidden">
                        <span className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">Stack</span>
                        <div className="flex flex-col-reverse w-full px-2 pb-2 gap-1 mt-6 overflow-hidden">
                            <AnimatePresence>
                                {displayStack.map((symbol, i) => (
                                    <motion.div
                                        key={`${symbol}-${i}`}
                                        initial={{ opacity: 0, scaleY: 0, originY: 1 }}
                                        animate={{ opacity: 1, scaleY: 1 }}
                                        exit={{ opacity: 0, scaleY: 0, originY: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        className={cn(
                                            "w-full h-9 flex items-center justify-center font-mono font-bold text-sm rounded-lg border transition-colors",
                                            i === displayStack.length - 1
                                                ? "bg-primary text-white border-primary shadow-md"
                                                : "bg-white dark:bg-slate-800 text-text-primary border-border"
                                        )}
                                    >
                                        {symbol}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Execution Log */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 flex-shrink-0">Execution Log</h4>
                        <div className="flex-1 space-y-1.5 overflow-y-auto">
                            <AnimatePresence>
                                {timeline.length === 0 ? (
                                    <p className="text-xs text-text-secondary text-center py-4">Run a simulation to see the execution trace.</p>
                                ) : (
                                    timeline.map((entry, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => setCurrentStep(idx)}
                                            className={cn(
                                                "w-full flex items-center justify-between text-xs rounded-lg px-3 py-2 transition-colors text-left border",
                                                currentStep === idx
                                                    ? "bg-primary/10 border-primary/30 text-primary font-bold"
                                                    : "bg-gray-50 dark:bg-slate-900/50 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary"
                                            )}
                                        >
                                            <span>{entry.action}</span>
                                            <span className="font-mono ml-2 opacity-70">{entry.state}</span>
                                        </motion.button>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
