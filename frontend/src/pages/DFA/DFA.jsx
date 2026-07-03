import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, Controls, Background, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Panel, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, RotateCcw, SkipBack, SkipForward, Download, Settings, Save, Upload, Plus, Trash2, CheckCircle2, XCircle, Edit2, Check, X } from 'lucide-react';
import Button from '../../components/buttons/Button';
import { Input } from '../../components/forms/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { AutomataEngine } from '../../services/simulation/dfaEngine';

const initialNodes = [
    { id: 'q0', position: { x: 120, y: 160 }, data: { label: 'q0' }, style: { background: '#fff', border: '2px solid #2563EB', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 } },
    { id: 'q1', position: { x: 340, y: 160 }, data: { label: 'q1 ★' }, style: { background: '#fff', border: '4px solid #22C55E', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#22C55E' } },
];

const initialEdges = [
    { id: 'e1', source: 'q0', target: 'q1', label: 'a', animated: false, style: { stroke: '#2563EB', strokeWidth: 2 } },
    { id: 'e2', source: 'q1', target: 'q1', label: 'a, b', animated: false, type: 'self' },
    { id: 'e3', source: 'q0', target: 'q0', label: 'b', animated: false, type: 'self' },
];

// ─── Node Label Editor ───────────────────────────────────────────────────────
function NodeLabelEditor({ node, onSave, onCancel }) {
    const [val, setVal] = useState(node.data.label);
    return (
        <div className="flex items-center gap-1">
            <input
                autoFocus
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel(); }}
                className="w-20 h-7 px-1.5 border border-primary rounded text-xs font-mono outline-none"
            />
            <button onClick={() => onSave(val)} className="text-green-600 p-0.5 hover:bg-green-50 rounded"><Check size={13} /></button>
            <button onClick={onCancel} className="text-red-500 p-0.5 hover:bg-red-50 rounded"><X size={13} /></button>
        </div>
    );
}

// ─── Inner DFA Component (needs ReactFlow context) ───────────────────────────
function DFAInner() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [alphabet, setAlphabet] = useState('a, b');
    const [testString, setTestString] = useState('abba');
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [timeline, setTimeline] = useState([]);
    const [simResult, setSimResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [toast, setToast] = useState(null);
    const flowRef = useRef(null);
    const { getNodes, getEdges } = useReactFlow();

    const showToast = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: false, style: { stroke: '#2563EB', strokeWidth: 2 } }, eds)), []);

    const handleReset = () => {
        setSimulationStatus('idle');
        setSimResult(null);
        setTimeline([]);
        setCurrentStep(0);
        setEdges(eds => eds.map(e => ({ ...e, animated: false })));
    };

    const handleRunSimulation = () => {
        handleReset();
        if (!testString.trim()) { showToast('Please enter a test string.', 'warn'); return; }

        const transitions = {};
        edges.forEach(edge => {
            if (!transitions[edge.source]) transitions[edge.source] = {};
            const symbols = edge.label ? edge.label.split(',').map(s => s.trim()) : [''];
            symbols.forEach(sym => {
                if (!transitions[edge.source][sym]) transitions[edge.source][sym] = [];
                transitions[edge.source][sym].push(edge.target);
            });
        });

        const alphaSet = alphabet.split(',').map(s => s.trim()).filter(Boolean);
        const stateSet = nodes.map(n => n.id);
        const finalStates = nodes.filter(n => n.data.label.includes('★')).map(n => n.id);
        const initialState = nodes[0]?.id || 'q0';

        if (finalStates.length === 0) {
            showToast('Mark at least one final state by adding ★ to its label.', 'error');
            return;
        }

        const engine = new AutomataEngine(stateSet, alphaSet, transitions, initialState, finalStates);
        const valid = engine.validateDefinition();
        if (!valid.isValid) {
            showToast('Definition Error: ' + valid.errors.join(', '), 'error');
            return;
        }

        const result = engine.simulate(testString);
        setTimeline(result.timeline);
        setSimResult(result);
        setSimulationStatus('done');
        setCurrentStep(result.timeline.length - 1);
    };

    const handleStepBack = () => setCurrentStep(s => Math.max(0, s - 1));
    const handleStepForward = () => setCurrentStep(s => Math.min(timeline.length - 1, s + 1));

    const activeState = timeline.length > 0 && timeline[currentStep] ? timeline[currentStep].activeStates : [];

    const displayNodes = nodes.map(n => ({
        ...n,
        style: {
            ...n.style,
            background: activeState.includes(n.id) ? '#EFF6FF' : '#fff',
            boxShadow: activeState.includes(n.id) ? '0 0 0 3px #2563EB' : 'none',
        }
    }));

    const handleAddNode = () => {
        const id = `q${nodes.length}`;
        setNodes(ns => [...ns, {
            id,
            position: { x: 120 + nodes.length * 200, y: 160 },
            data: { label: id },
            style: { background: '#fff', border: '2px solid #6B7280', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }
        }]);
    };

    const handleSaveNodeLabel = (nodeId, newLabel) => {
        const isFinal = newLabel.includes('★');
        setNodes(ns => ns.map(n => n.id === nodeId ? {
            ...n,
            data: { ...n.data, label: newLabel },
            style: {
                ...n.style,
                border: isFinal ? '4px solid #22C55E' : '2px solid #6B7280',
                color: isFinal ? '#22C55E' : '#111827',
            }
        } : n));
        setEditingNodeId(null);
    };

    const handleExportPNG = () => {
        const el = document.querySelector('.react-flow');
        if (!el) { showToast('Could not find diagram to export.', 'error'); return; }
        // Use native browser print / screenshot approach as fallback
        try {
            const svgEl = el.querySelector('.react-flow__renderer');
            if (svgEl) {
                const canvas = document.createElement('canvas');
                const rect = el.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);
                ctx.fillStyle = '#F8FAFC';
                ctx.fillRect(0, 0, rect.width, rect.height);
                showToast('Use browser Print → Save as PDF for best results.', 'info');
            }
        } catch {
            showToast('Use Ctrl+P → Save as PDF to export the diagram.', 'info');
        }
    };

    const handleSave = () => {
        const data = { nodes, edges, alphabet };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dfa-model.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('DFA model saved as dfa-model.json!', 'success');
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-background overflow-hidden relative">

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        className={cn(
                            "fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2",
                            toast.type === 'success' && "bg-green-50 border-green-300 text-green-700",
                            toast.type === 'error' && "bg-red-50 border-red-300 text-red-700",
                            toast.type === 'warn' && "bg-yellow-50 border-yellow-300 text-yellow-700",
                            toast.type === 'info' && "bg-blue-50 border-blue-300 text-blue-700",
                        )}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Configuration Panel */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 border-r border-border bg-white dark:bg-card-dark overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-border sticky top-0 bg-white/95 dark:bg-card-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-base text-text-primary dark:text-white">DFA / NFA Simulator</h2>
                        <p className="text-xs text-text-secondary dark:text-slate-300 mt-0.5">Build & simulate Finite Automata</p>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Save JSON" onClick={handleSave}><Save size={15} /></Button>
                    </div>
                </div>

                <div className="p-4 space-y-5 flex-1">
                    <section>
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Formal Definition</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1 block">Input Alphabet (Σ)</label>
                                <Input value={alphabet} onChange={e => setAlphabet(e.target.value)} placeholder="e.g. a, b" className="h-9 font-mono" />
                                <p className="text-[11px] text-text-secondary mt-1">Separate symbols with commas</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 block">States (Q)</label>
                                    <Button variant="ghost" size="xs" onClick={handleAddNode} startIcon={<Plus size={12} />}>Add State</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {nodes.map(n => (
                                        <div key={n.id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-800 border border-border rounded-md text-xs font-mono">
                                            {editingNodeId === n.id ? (
                                                <NodeLabelEditor
                                                    node={n}
                                                    onSave={(val) => handleSaveNodeLabel(n.id, val)}
                                                    onCancel={() => setEditingNodeId(null)}
                                                />
                                            ) : (
                                                <>
                                                    <span>{n.data.label}</span>
                                                    <button
                                                        onClick={() => setEditingNodeId(n.id)}
                                                        className="text-text-secondary hover:text-primary transition-colors ml-1"
                                                        title="Edit label"
                                                    >
                                                        <Edit2 size={10} />
                                                    </button>
                                                    <button onClick={() => setNodes(ns => ns.filter(x => x.id !== n.id))} className="text-text-secondary hover:text-danger transition-colors ml-0.5">
                                                        <Trash2 size={11} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-text-secondary dark:text-slate-400 mt-2">Click <Edit2 size={10} className="inline" /> to rename. Add <span className="font-mono">★</span> to mark as final. E.g. <span className="font-mono">q1 ★</span></p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest mb-3">Transition Table (δ)</h3>
                        <div className="overflow-x-auto border border-border rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="text-text-secondary bg-gray-50 dark:bg-slate-900/50 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 border-b border-border font-semibold">State</th>
                                        {alphabet.split(',').map(s => s.trim()).filter(Boolean).map(sym => (
                                            <th key={sym} className="px-3 py-2 border-b border-border font-semibold font-mono">'{sym}'</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.map((n, i) => (
                                        <tr key={n.id} className={cn("border-b border-border last:border-0", activeState.includes(n.id) ? "bg-primary/5" : "bg-white dark:bg-card-dark")}>
                                            <td className="px-3 py-2 font-mono font-bold text-text-primary dark:text-white">{i === 0 ? '→ ' : ''}{n.data.label}</td>
                                            {alphabet.split(',').map(s => s.trim()).filter(Boolean).map(sym => {
                                                const edge = edges.find(e => e.source === n.id && e.label && e.label.split(',').map(x => x.trim()).includes(sym));
                                                return <td key={sym} className="px-3 py-2 font-mono text-text-secondary">{edge ? edge.target : '–'}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Simulation Controls */}
                <div className="p-4 border-t border-border bg-gray-50 dark:bg-slate-900/30 space-y-3">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Simulation</h3>
                    <Input
                        placeholder="Enter test string (e.g. abba)"
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
                        className="font-mono"
                    />
                    <div className="flex gap-2">
                        <Button fullWidth onClick={handleRunSimulation} startIcon={<Play size={15} />}>Run</Button>
                        <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep <= 0 || timeline.length === 0} title="Step Back"><SkipBack size={15} /></Button>
                        <Button variant="outline" size="icon" onClick={handleStepForward} disabled={currentStep >= timeline.length - 1 || timeline.length === 0} title="Step Forward"><SkipForward size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={handleReset} title="Reset"><RotateCcw size={15} /></Button>
                    </div>

                    {timeline.length > 0 && (
                        <div className="text-xs text-text-secondary text-center">
                            Step <span className="font-bold text-primary">{currentStep + 1}</span> / {timeline.length}
                            {timeline[currentStep] && (
                                <span className="ml-2">— State: <span className="font-mono font-bold">{timeline[currentStep].activeStates.join(', ') || '∅'}</span></span>
                            )}
                        </div>
                    )}

                    {/* Result Badge */}
                    {simResult && (
                        <motion.div
                            key={simResult.accepted ? 'accepted' : 'rejected'}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border font-semibold text-sm",
                                simResult.accepted
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 text-green-700 dark:text-green-400"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-300 text-red-700 dark:text-red-400"
                            )}
                        >
                            {simResult.accepted ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                            <div>
                                <div>{simResult.accepted ? 'String Accepted ✓' : 'String Rejected ✗'}</div>
                                <div className="text-xs font-normal opacity-80 mt-0.5">{simResult.reason}</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </aside>

            {/* Graph Visualization */}
            <main className="flex-1 flex flex-col relative bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden" ref={flowRef}>
                <ReactFlow
                    nodes={displayNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="w-full flex-1"
                >
                    <Background color="#CBD5E1" gap={20} size={1} />
                    <Controls className="bg-white dark:bg-card-dark border border-border rounded-xl shadow-soft-sm overflow-hidden" />
                    <MiniMap className="rounded-xl shadow-soft-sm border border-border !bg-white dark:!bg-slate-900" />
                    <Panel position="top-right" className="m-4 flex gap-2">
                        <Button variant="outline" size="sm" startIcon={<Download size={13} />} className="bg-white/90 backdrop-blur-sm shadow-soft-sm" onClick={handleExportPNG}>
                            Export PNG
                        </Button>
                    </Panel>
                    <Panel position="top-left" className="m-3">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 text-xs text-text-secondary dark:text-slate-300">
                            <span className="font-semibold text-text-primary dark:text-white">Tip:</span> Drag nodes · Connect handles to create transitions
                        </div>
                    </Panel>
                </ReactFlow>

                {/* Execution Timeline Bar */}
                {timeline.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-soft-lg border border-border"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Execution Trace</span>
                            <span className="text-xs text-text-secondary">Step {currentStep + 1} / {timeline.length}</span>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                            {timeline.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={cn(
                                        "flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg transition-all",
                                        idx === currentStep ? "bg-primary text-white scale-110 shadow-md" : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <span className="text-[10px] font-semibold opacity-70">{t.activeStates.join(',') || '∅'}</span>
                                    <span className="text-sm font-mono font-bold mt-0.5">{t.symbol ?? 'ε'}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function DFA() {
    return (
        <ReactFlowProvider>
            <DFAInner />
        </ReactFlowProvider>
    );
}
