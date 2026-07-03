import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layers, Play, Plus, Trash2, ArrowRight, CheckCircle2, XCircle, RefreshCw, SkipBack, SkipForward } from 'lucide-react';
import Button from '../../components/buttons/Button';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const defaultTransitions = [
    { id: 1, from: 'q0', input: 'a', stackTop: 'Z0', toState: 'q0', pushSymbols: 'AZ0' },
    { id: 2, from: 'q0', input: 'a', stackTop: 'A',  toState: 'q0', pushSymbols: 'AA' },
    { id: 3, from: 'q0', input: 'b', stackTop: 'A',  toState: 'q1', pushSymbols: 'ε' },
    { id: 4, from: 'q1', input: 'b', stackTop: 'A',  toState: 'q1', pushSymbols: 'ε' },
    { id: 5, from: 'q1', input: 'ε', stackTop: 'Z0', toState: 'q2', pushSymbols: 'Z0' },
];

const makeNode = (id, x, y, isFinal = false) => ({
    id,
    position: { x, y },
    data: { label: isFinal ? `${id} ★` : id },
    style: {
        background: '#fff',
        border: `${isFinal ? '4px' : '2px'} solid ${isFinal ? '#22C55E' : '#6B7280'}`,
        borderRadius: '50%',
        width: 64, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13,
        color: isFinal ? '#22C55E' : '#111827',
    }
});

const initialNodes = [
    makeNode('q0', 80, 160),
    makeNode('q1', 300, 160),
    makeNode('q2', 520, 160, true),
];

const initialEdges = [
    { id: 'e1', source: 'q0', target: 'q0', label: 'a,Z0/AZ0', type: 'self', style: { stroke: '#2563EB', strokeWidth: 2 } },
    { id: 'e2', source: 'q0', target: 'q0', label: 'a,A/AA',   type: 'self', style: { stroke: '#2563EB', strokeWidth: 2 } },
    { id: 'e3', source: 'q0', target: 'q1', label: 'b,A/ε',    animated: false, style: { stroke: '#7C3AED', strokeWidth: 2 } },
    { id: 'e4', source: 'q1', target: 'q1', label: 'b,A/ε',    type: 'self', style: { stroke: '#7C3AED', strokeWidth: 2 } },
    { id: 'e5', source: 'q1', target: 'q2', label: 'ε,Z0/Z0',  animated: false, style: { stroke: '#22C55E', strokeWidth: 2 } },
];

export default function PDA() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [inputAlphabet, setInputAlphabet] = useState('a, b');
    const [stackAlphabet, setStackAlphabet] = useState('A, Z0');
    const [testString, setTestString] = useState('aabb');
    const [acceptMode, setAcceptMode] = useState('empty_stack');
    const [transitions, setTransitions] = useState(defaultTransitions);
    const [stack, setStack] = useState(['Z0']);
    const [simResult, setSimResult] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const onNodesChange = useCallback((changes) => setNodes(nds => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges(eds => addEdge({ ...params, style: { stroke: '#2563EB', strokeWidth: 2 } }, eds)), []);

    const handleDeleteTransition = (id) => setTransitions(t => t.filter(x => x.id !== id));
    const handleAddTransition = () => setTransitions(t => [...t, { id: Date.now(), from: 'q0', input: 'a', stackTop: 'Z0', toState: 'q0', pushSymbols: 'AZ0' }]);

    const handleSimulate = () => {
        if (!testString.trim()) return;
        const demoTimeline = [];
        const chars = testString.split('');
        let currentStack = ['Z0'];
        let rejected = false;

        demoTimeline.push({ step: 0, state: 'q0', symbol: null, stackSnapshot: [...currentStack], action: 'Initial configuration' });

        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (ch === 'a') {
                currentStack = ['A', ...currentStack];
                demoTimeline.push({ step: i + 1, state: 'q0', symbol: ch, stackSnapshot: [...currentStack], action: `Read 'a' → Push A onto stack` });
            } else if (ch === 'b') {
                if (currentStack[0] === 'A') {
                    currentStack = currentStack.slice(1);
                    demoTimeline.push({ step: i + 1, state: 'q1', symbol: ch, stackSnapshot: [...currentStack], action: `Read 'b' → Pop A from stack` });
                } else {
                    rejected = true;
                    demoTimeline.push({ step: i + 1, state: 'q1', symbol: ch, stackSnapshot: [...currentStack], action: `Read 'b' → Stack underflow! REJECT` });
                    break;
                }
            }
        }

        const accepted = !rejected && (acceptMode === 'empty_stack'
            ? currentStack.length === 1 && currentStack[0] === 'Z0'
            : currentStack.length > 0);

        if (!rejected) {
            demoTimeline.push({ step: demoTimeline.length, state: accepted ? 'q2' : 'q1', symbol: null, stackSnapshot: [...currentStack], action: accepted ? 'Accept by Empty Stack (Z₀ remains) ✓' : 'Reject — stack not drained ✗' });
        }

        setSimResult({ accepted, reason: accepted ? `Accepted — stack contains only Z₀.` : `Rejected — ${rejected ? "stack underflow" : "stack not drained"}.` });
        setTimeline(demoTimeline);
        setStack(currentStack);
        setCurrentStep(0);
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

    const activeState = timeline.length > 0 && timeline[currentStep] ? timeline[currentStep].state : null;

    const displayNodes = nodes.map(n => ({
        ...n,
        style: {
            ...n.style,
            background: activeState === n.id ? '#EFF6FF' : '#fff',
            boxShadow: activeState === n.id ? '0 0 0 4px #2563EB' : 'none',
        }
    }));

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-background dark:bg-[#0F172A] overflow-hidden">

            {/* Left Panel */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 border-r border-border bg-white dark:bg-card-dark overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-border sticky top-0 bg-white/95 dark:bg-card-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-base text-text-primary dark:text-white">PDA Simulator</h2>
                        <p className="text-xs text-text-secondary dark:text-slate-300 mt-0.5">Pushdown Automata & Stack Visualization</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">a^n b^n</span>
                    </div>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    <section>
                        <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest mb-3">Formal Definition</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1 block">Input Alphabet (Σ)</label>
                                <input value={inputAlphabet} onChange={e => setInputAlphabet(e.target.value)}
                                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-900 border border-border rounded-lg text-sm font-mono outline-none focus:border-primary transition-colors dark:text-white" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1 block">Stack Alphabet (Γ)</label>
                                <input value={stackAlphabet} onChange={e => setStackAlphabet(e.target.value)}
                                    className="w-full h-9 px-3 bg-gray-50 dark:bg-slate-900 border border-border rounded-lg text-sm font-mono outline-none focus:border-primary transition-colors dark:text-white" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1 block">Acceptance Mode</label>
                            <select value={acceptMode} onChange={e => setAcceptMode(e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-white dark:bg-slate-800 dark:text-white text-sm outline-none focus:border-primary transition-colors">
                                <option value="empty_stack">Accept by Empty Stack</option>
                                <option value="final_state">Accept by Final State</option>
                            </select>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Transitions (δ)</h3>
                            <Button variant="ghost" size="xs" onClick={handleAddTransition} startIcon={<Plus size={12} />}>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {transitions.map(t => (
                                <div key={t.id} className="flex items-center gap-2 p-2.5 border border-border rounded-xl bg-gray-50 dark:bg-slate-900/50 text-xs">
                                    <div className="flex-1 flex items-center gap-1.5 flex-wrap min-w-0">
                                        <span className="font-mono bg-white dark:bg-slate-800 dark:text-white px-2 py-1 rounded-md border border-border font-semibold whitespace-nowrap">
                                            ({t.from}, {t.input}, {t.stackTop})
                                        </span>
                                        <ArrowRight size={12} className="text-text-secondary flex-shrink-0" />
                                        <span className="font-mono bg-white dark:bg-slate-800 dark:text-white px-2 py-1 rounded-md border border-border font-semibold whitespace-nowrap">
                                            ({t.toState}, {t.pushSymbols})
                                        </span>
                                    </div>
                                    <button onClick={() => handleDeleteTransition(t.id)} className="text-text-secondary hover:text-red-500 transition-colors flex-shrink-0 p-1">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Simulation Input */}
                <div className="p-4 border-t border-border bg-gray-50 dark:bg-slate-900/30 space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Simulation</h3>
                    <input
                        value={testString}
                        onChange={e => setTestString(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSimulate()}
                        placeholder="Test string (e.g. aabb)"
                        className="w-full h-10 px-3 bg-white dark:bg-slate-900 dark:text-white border border-border rounded-lg font-mono text-sm outline-none focus:border-primary transition-colors"
                    />
                    <div className="flex gap-2">
                        <Button fullWidth onClick={handleSimulate} startIcon={<Play size={15} />}>Run Simulation</Button>
                        <Button variant="ghost" size="icon" onClick={handleReset} title="Reset"><RefreshCw size={15} /></Button>
                    </div>

                    {simResult && (
                        <motion.div
                            key={simResult.accepted ? 'accepted' : 'rejected'}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border text-sm font-semibold",
                                simResult.accepted ? "bg-green-50 dark:bg-green-900/20 border-green-300 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 border-red-300 text-red-700 dark:text-red-400"
                            )}
                        >
                            {simResult.accepted ? <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="mt-0.5 flex-shrink-0" />}
                            <div>
                                <div>{simResult.accepted ? 'String Accepted ✓' : 'String Rejected ✗'}</div>
                                <div className="text-xs font-normal opacity-75 mt-0.5">{simResult.reason}</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </aside>

            {/* Right: Graph + Stack */}
            <main className="flex-1 flex flex-col relative bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">

                {/* React Flow Graph */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={displayNodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        className="w-full h-full"
                    >
                        <Background color="#CBD5E1" gap={20} size={1} />
                        <Controls className="bg-white dark:bg-slate-800 border border-border rounded-xl shadow-soft-sm overflow-hidden" />
                        <MiniMap className="rounded-xl shadow-soft-sm border border-border !bg-white dark:!bg-slate-900" />
                        <Panel position="top-left" className="m-3">
                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 text-xs text-text-secondary dark:text-slate-300">
                                <span className="font-semibold text-text-primary dark:text-white">Grammar:</span> {'{ aⁿbⁿ | n ≥ 1 }'}
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Stack + Execution Log */}
                <div className="h-56 bg-white dark:bg-card-dark border-t border-border flex gap-4 p-4 overflow-hidden flex-shrink-0">

                    {/* Stack Visualizer */}
                    <div className="relative w-28 flex flex-col justify-end items-center rounded-xl border-2 border-border bg-gray-50 dark:bg-slate-900/50 overflow-hidden flex-shrink-0">
                        <span className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Stack</span>
                        <div className="flex flex-col-reverse w-full px-2 pb-2 gap-1 mt-6 overflow-hidden">
                            {displayStack.map((symbol, i) => (
                                <motion.div
                                    key={`stack-${i}-${symbol}`}
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className={cn(
                                        "w-full h-9 flex items-center justify-center font-mono font-bold text-sm rounded-lg border transition-colors",
                                        i === displayStack.length - 1
                                            ? "bg-primary text-white border-primary shadow-md"
                                            : "bg-white dark:bg-slate-800 dark:text-white border-border"
                                    )}
                                >
                                    {symbol}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Execution Log + Steps */}
                    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                        <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest">Execution Log</h4>
                            {timeline.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep <= 0}
                                        className="p-1 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
                                        <SkipBack size={12} />
                                    </button>
                                    <span className="text-[10px] text-text-secondary dark:text-slate-400 font-mono px-1">{currentStep + 1}/{timeline.length}</span>
                                    <button onClick={() => setCurrentStep(s => Math.min(timeline.length - 1, s + 1))} disabled={currentStep >= timeline.length - 1}
                                        className="p-1 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors">
                                        <SkipForward size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1.5 overflow-y-auto">
                            {timeline.length === 0 ? (
                                <p className="text-xs text-text-secondary dark:text-slate-400 text-center py-4">Run a simulation to see the execution trace.</p>
                            ) : (
                                timeline.map((entry, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentStep(idx)}
                                        className={cn(
                                            "w-full flex items-center justify-between text-xs rounded-lg px-3 py-2 transition-colors text-left border",
                                            currentStep === idx
                                                ? "bg-primary/10 border-primary/30 text-primary font-bold"
                                                : "bg-gray-50 dark:bg-slate-900/50 border-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-text-secondary dark:text-slate-300"
                                        )}
                                    >
                                        <span className="truncate">{entry.action}</span>
                                        <span className="font-mono ml-2 opacity-70 flex-shrink-0">{entry.state}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
