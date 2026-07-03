import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, RotateCcw, SkipBack, SkipForward, Download, Settings, Save, Upload, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/cards/Card';
import Button from '../../components/buttons/Button';
import { Input } from '../../components/forms/Input';
import { motion } from 'framer-motion';
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

export default function DFA() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [alphabet, setAlphabet] = useState('a, b');
    const [testString, setTestString] = useState('abba');
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [timeline, setTimeline] = useState([]);
    const [simResult, setSimResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(-1);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: false, style: { stroke: '#2563EB', strokeWidth: 2 } }, eds)), []);

    const handleReset = () => {
        setSimulationStatus('idle');
        setSimResult(null);
        setTimeline([]);
        setCurrentStep(-1);
        // Remove highlight from edges
        setEdges(eds => eds.map(e => ({ ...e, animated: false })));
    };

    const handleRunSimulation = () => {
        handleReset();
        if (!testString.trim()) return;

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
        // detect final states: nodes with ★ in label
        const finalStates = nodes.filter(n => n.data.label.includes('★')).map(n => n.id);
        const initialState = nodes[0]?.id || 'q0';

        if (finalStates.length === 0) {
            alert('Please mark at least one final state by adding ★ to its label.');
            return;
        }

        const engine = new AutomataEngine(stateSet, alphaSet, transitions, initialState, finalStates);
        const valid = engine.validateDefinition();
        if (!valid.isValid) {
            alert('Definition Error: ' + valid.errors.join(', '));
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

    const activeState = currentStep >= 0 && timeline[currentStep] ? timeline[currentStep].activeStates : [];

    // Highlight active nodes in graph
    const displayNodes = nodes.map(n => ({
        ...n,
        style: {
            ...n.style,
            background: activeState.includes(n.id) ? '#EFF6FF' : '#fff',
            boxShadow: activeState.includes(n.id) ? '0 0 0 3px #2563EB' : 'none',
        }
    }));

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-background overflow-hidden">

            {/* Configuration Panel */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 border-r border-border bg-white dark:bg-card-dark overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-border sticky top-0 bg-white/95 dark:bg-card-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-base text-text-primary dark:text-white">DFA / NFA Simulator</h2>
                        <p className="text-xs text-text-secondary dark:text-slate-300 mt-0.5">Build & simulate Finite Automata</p>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Save"><Save size={15} /></Button>
                        <Button variant="ghost" size="icon" title="Settings"><Settings size={15} /></Button>
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
                                    <label className="text-xs font-semibold text-text-secondary dark:text-slate-300 mb-1 block">States (Q)</label>
                                    <Button variant="ghost" size="xs" onClick={() => {
                                        const id = `q${nodes.length}`;
                                        setNodes(ns => [...ns, { id, position: { x: 120 + nodes.length * 200, y: 160 }, data: { label: id }, style: { background: '#fff', border: '2px solid #6B7280', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 } }]);
                                    }} startIcon={<Plus size={12} />}>Add State</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {nodes.map(n => (
                                        <div key={n.id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-slate-800 border border-border rounded-md text-xs font-mono">
                                            <span>{n.data.label}</span>
                                            <button onClick={() => setNodes(ns => ns.filter(x => x.id !== n.id))} className="text-text-secondary hover:text-danger transition-colors ml-1">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-text-secondary dark:text-slate-400 mt-2">Add ★ to node label to mark it as a final state. E.g. <span className="font-mono">q1 ★</span></p>
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
                        <Button variant="outline" size="icon" onClick={handleStepBack} disabled={currentStep <= 0} title="Step Back"><SkipBack size={15} /></Button>
                        <Button variant="outline" size="icon" onClick={handleStepForward} disabled={currentStep >= timeline.length - 1} title="Step Forward"><SkipForward size={15} /></Button>
                        <Button variant="ghost" size="icon" onClick={handleReset} title="Reset"><RotateCcw size={15} /></Button>
                    </div>

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
            <main className="flex-1 flex flex-col relative bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
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
                    <Panel position="top-right" className="m-4">
                        <Button variant="outline" size="sm" startIcon={<Download size={13} />} className="bg-white/90 backdrop-blur-sm shadow-soft-sm">
                            Export PNG
                        </Button>
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
                                <span className="text-xs text-text-secondary">Step {Math.max(0, currentStep)} / {timeline.length - 1}</span>
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
                                        <span className="text-[10px] font-semibold opacity-70">{t.activeStates.join(',')}</span>
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
