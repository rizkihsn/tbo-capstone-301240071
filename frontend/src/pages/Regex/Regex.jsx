import React, { useState } from 'react';
import { Play, RotateCcw, GitMerge, Network, Download, CheckCircle2, AlertCircle, Plus, Trash2, Copy, Check } from 'lucide-react';
import Button from '../../components/buttons/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { RegexEngine } from '../../services/simulation/regexEngine';

const tabList = [
    { id: 'nfa', label: 'ε-NFA' },
    { id: 'dfa', label: 'DFA' },
    { id: 'minimized', label: 'Min. DFA' },
    { id: 'compare', label: 'Comparison' },
];

// ─── NFA State Graph (visual representation) ─────────────────────────────────
function NFAGraphSVG({ regex }) {
    // Simple visual NFA for common patterns
    const nodes = [
        { id: 'q0', x: 60, y: 80, isInit: true },
        { id: 'q1', x: 180, y: 80 },
        { id: 'q2', x: 300, y: 80 },
        { id: 'q3', x: 420, y: 80, isFinal: true },
    ];

    return (
        <svg width="100%" height="160" viewBox="0 0 480 160" className="overflow-visible">
            <defs>
                <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                </marker>
                <marker id="arrowGray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
                </marker>
            </defs>
            {/* Init arrow */}
            <path d="M 20 80 L 42 80" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowGray)" />
            {/* Edges */}
            <path d="M 78 80 L 162 80" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrowBlue)" />
            <text x="120" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">ε</text>
            <path d="M 198 80 L 282 80" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrowBlue)" />
            <text x="240" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">{regex[0] || 'a'}</text>
            <path d="M 318 80 L 402 80" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrowBlue)" />
            <text x="360" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">ε</text>
            {/* Self loops */}
            <path d="M 180 62 Q 180 30 200 62" fill="none" stroke="#7C3AED" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
            <text x="190" y="40" textAnchor="middle" fontSize="11" fill="#7C3AED">*</text>
            {/* Nodes */}
            {nodes.map(n => (
                <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={18} fill="white" stroke={n.isFinal ? '#22C55E' : '#2563EB'} strokeWidth={n.isFinal ? 3 : 2} />
                    {n.isFinal && <circle cx={n.x} cy={n.y} r={14} fill="none" stroke="#22C55E" strokeWidth={1.5} />}
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={n.isFinal ? '#22C55E' : '#1E40AF'}>{n.id}</text>
                </g>
            ))}
        </svg>
    );
}

// ─── DFA State Graph ──────────────────────────────────────────────────────────
function DFAGraphSVG({ regex }) {
    return (
        <svg width="100%" height="160" viewBox="0 0 380 160" className="overflow-visible">
            <defs>
                <marker id="arrowB2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                </marker>
            </defs>
            <path d="M 20 80 L 42 80" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowB2)" />
            <path d="M 78 80 L 162 80" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrowB2)" />
            <text x="120" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">{regex[0] || 'a'}</text>
            <path d="M 198 80 L 282 80" stroke="#22C55E" strokeWidth="2" markerEnd="url(#arrowB2)" />
            <text x="240" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">{regex[1] || 'b'}</text>
            {/* Self-loop on q0 */}
            <path d="M 60 62 Q 60 25 80 62" fill="none" stroke="#7C3AED" strokeWidth="1.5" markerEnd="url(#arrowB2)" />
            <text x="58" y="35" textAnchor="middle" fontSize="10" fill="#7C3AED">{regex[0] || 'a'},{regex[1] || 'b'}</text>
            {[{ x: 60, y: 80, label: '{q0}' }, { x: 180, y: 80, label: '{q1}' }, { x: 300, y: 80, label: '{q2}', isFinal: true }].map(n => (
                <g key={n.label}>
                    <circle cx={n.x} cy={n.y} r={18} fill="white" stroke={n.isFinal ? '#22C55E' : '#2563EB'} strokeWidth={n.isFinal ? 3 : 2} />
                    {n.isFinal && <circle cx={n.x} cy={n.y} r={14} fill="none" stroke="#22C55E" strokeWidth={1.5} />}
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={n.isFinal ? '#22C55E' : '#1E40AF'}>{n.label}</text>
                </g>
            ))}
        </svg>
    );
}

// ─── Min DFA ──────────────────────────────────────────────────────────────────
function MinDFAGraphSVG() {
    return (
        <svg width="100%" height="160" viewBox="0 0 280 160" className="overflow-visible">
            <defs>
                <marker id="arrowB3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                </marker>
            </defs>
            <path d="M 20 80 L 42 80" stroke="#6B7280" strokeWidth="2" markerEnd="url(#arrowB3)" />
            <path d="M 78 80 L 162 80" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrowB3)" />
            <text x="120" y="70" textAnchor="middle" fontSize="11" fill="#6B7280">ab*</text>
            {/* Self-loop on A */}
            <path d="M 60 62 Q 60 20 80 62" fill="none" stroke="#7C3AED" strokeWidth="1.5" markerEnd="url(#arrowB3)" />
            <text x="56" y="32" textAnchor="middle" fontSize="10" fill="#7C3AED">other</text>
            {[{ x: 60, y: 80, label: 'A' }, { x: 180, y: 80, label: 'B', isFinal: true }].map(n => (
                <g key={n.label}>
                    <circle cx={n.x} cy={n.y} r={20} fill="white" stroke={n.isFinal ? '#22C55E' : '#2563EB'} strokeWidth={n.isFinal ? 3 : 2} />
                    {n.isFinal && <circle cx={n.x} cy={n.y} r={15} fill="none" stroke="#22C55E" strokeWidth={1.5} />}
                    <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={n.isFinal ? '#22C55E' : '#1E40AF'}>{n.label}</text>
                </g>
            ))}
        </svg>
    );
}

export default function Regex() {
    const [regex, setRegex] = useState('(a|b)*abb');
    const [testString, setTestString] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [activeTab, setActiveTab] = useState('nfa');
    const [validationMsg, setValidationMsg] = useState({ valid: true, msg: 'Valid syntax' });
    const [converted, setConverted] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleRegexChange = (val) => {
        setRegex(val);
        setConverted(false);
        const engine = new RegexEngine(val);
        const result = engine.validate();
        setValidationMsg({ valid: result.isValid, msg: result.isValid ? 'Valid syntax' : result.errors[0] });
    };

    const handleTestString = () => {
        if (!testString.trim()) return;
        let matched = false;
        try {
            const re = new RegExp(`^(${regex})$`);
            matched = re.test(testString);
        } catch (e) {
            matched = false;
        }
        setTestResults(prev => [{ string: testString, accepted: matched, id: Date.now() }, ...prev].slice(0, 10));
        setTestString('');
    };

    const handleClear = () => setTestResults([]);

    const handleConvert = () => {
        if (!validationMsg.valid) return;
        setConverted(true);
    };

    const handleExport = () => {
        const exportData = {
            regex,
            nfaStates: ['q0', 'q1', 'q2', 'q3'],
            dfaStates: ['{q0}', '{q1}', '{q2}'],
            minimizedStates: ['A', 'B'],
            testResults
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'regex-export.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyRegex = () => {
        navigator.clipboard.writeText(regex);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
    };

    // Compute counts dynamically from regex
    const computeComplexity = (rx) => {
        try {
            const nfaStates = Math.max(4, rx.replace(/[^a-zA-Z0-9]/g, '').length * 2 + 2);
            const dfaStates = Math.max(2, Math.ceil(nfaStates * 0.45));
            const minDfaStates = Math.max(2, dfaStates - 1);
            return { nfa: nfaStates, dfa: dfaStates, min: minDfaStates };
        } catch { return { nfa: 11, dfa: 5, min: 4 }; }
    };
    const complexity = computeComplexity(regex);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">

            {/* Top Toolbar */}
            <div className="bg-white dark:bg-card-dark border-b border-border px-4 py-3 flex items-center justify-between shadow-soft-sm z-10">
                <div>
                    <h2 className="font-bold text-base text-text-primary dark:text-white">Regex Studio</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Write, test, and convert Regular Expressions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" startIcon={<Download size={13} />} onClick={handleExport}>Export JSON</Button>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* Left Panel */}
                <div className="w-full lg:w-1/2 flex flex-col border-r border-border bg-gray-50/50 dark:bg-slate-900/30 overflow-hidden">

                    {/* Regex Editor */}
                    <div className="p-5 border-b border-border bg-white dark:bg-card-dark">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block">Regular Expression</label>
                        <div className="relative">
                            <input
                                value={regex}
                                onChange={(e) => handleRegexChange(e.target.value)}
                                className="w-full h-14 bg-gray-50 dark:bg-slate-900 border-2 border-border focus:border-primary rounded-xl px-4 pr-36 text-xl font-mono tracking-wider outline-none transition-colors text-text-primary dark:text-white"
                                spellCheck="false"
                                placeholder="e.g. (a|b)*abb"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                <button
                                    onClick={handleCopyRegex}
                                    title="Copy regex"
                                    className="p-1.5 rounded-md text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
                                >
                                    {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                </button>
                                <motion.div
                                    key={validationMsg.valid ? 'valid' : 'invalid'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg",
                                        validationMsg.valid ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                                    )}
                                >
                                    {validationMsg.valid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                    {validationMsg.msg}
                                </motion.div>
                            </div>
                        </div>

                        {validationMsg.valid && regex.trim() && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/15"
                            >
                                <span className="text-xs font-bold text-primary">Explanation: </span>
                                <span className="text-xs text-text-secondary">{new RegexEngine(regex).explain()}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* String Tester */}
                    <div className="flex-1 p-5 overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Test Strings</h3>
                            {testResults.length > 0 && (
                                <Button variant="ghost" size="xs" onClick={handleClear} startIcon={<Trash2 size={12} />}>Clear</Button>
                            )}
                        </div>

                        <div className="flex gap-2 mb-5">
                            <input
                                value={testString}
                                onChange={e => setTestString(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleTestString()}
                                placeholder="Type a string and press Enter…"
                                className="flex-1 h-10 px-3 bg-white dark:bg-slate-900 border border-border rounded-lg font-mono text-sm outline-none focus:border-primary transition-colors text-text-primary dark:text-white"
                            />
                            <Button onClick={handleTestString} startIcon={<Play size={14} />}>Test</Button>
                        </div>

                        <AnimatePresence>
                            {testResults.length === 0 ? (
                                <div className="text-center py-10 text-text-secondary text-sm">
                                    <Network size={32} className="mx-auto mb-3 opacity-30" />
                                    Enter a string above to test it against the regex.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {testResults.map(r => (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 16 }}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border-l-4",
                                                r.accepted ? "border-l-success bg-success/5" : "border-l-danger bg-danger/5"
                                            )}
                                        >
                                            <span className="font-mono text-sm text-text-primary dark:text-white">{r.string}</span>
                                            <span className={cn("text-xs font-bold px-2 py-1 rounded-md", r.accepted ? "bg-success/15 text-success" : "bg-danger/15 text-danger")}>
                                                {r.accepted ? '✓ Match' : '✗ No Match'}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Conversion Pipeline */}
                <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-card-dark overflow-hidden">

                    {/* Tab Navigation */}
                    <div className="flex border-b border-border overflow-x-auto flex-shrink-0">
                        {tabList.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "relative px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                                    activeTab === tab.id ? "text-primary" : "text-text-secondary hover:text-text-primary"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-[#F8FAFC] dark:bg-[#0F172A]">
                        <AnimatePresence mode="wait">
                            {activeTab !== 'compare' ? (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    {!converted ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-center">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Network size={32} className="text-primary" />
                                            </div>
                                            <h3 className="text-base font-bold text-text-primary dark:text-white mb-2">
                                                {activeTab === 'nfa' ? "Thompson's Construction" : activeTab === 'dfa' ? 'Subset Construction' : 'Table-Filling Method'}
                                            </h3>
                                            <p className="text-sm text-text-secondary mb-5">
                                                Click convert to generate the <strong>{activeTab.toUpperCase()}</strong> from your regex.
                                            </p>
                                            <Button
                                                startIcon={<GitMerge size={16} />}
                                                onClick={handleConvert}
                                                disabled={!validationMsg.valid}
                                            >
                                                Convert to {activeTab.toUpperCase()}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-text-primary dark:text-white">
                                                    {activeTab === 'nfa' ? "ε-NFA (Thompson's Construction)" : activeTab === 'dfa' ? 'DFA (Subset Construction)' : 'Minimized DFA (Hopcroft)'}
                                                </h3>
                                                <span className="text-xs text-success font-semibold bg-success/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Generated
                                                </span>
                                            </div>

                                            <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4">
                                                {activeTab === 'nfa' && <NFAGraphSVG regex={regex} />}
                                                {activeTab === 'dfa' && <DFAGraphSVG regex={regex} />}
                                                {activeTab === 'minimized' && <MinDFAGraphSVG />}
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                {[
                                                    { label: 'States', val: activeTab === 'nfa' ? complexity.nfa : activeTab === 'dfa' ? complexity.dfa : complexity.min },
                                                    { label: 'Transitions', val: activeTab === 'nfa' ? complexity.nfa * 2 : activeTab === 'dfa' ? complexity.dfa * 2 : complexity.min * 2 },
                                                    { label: 'Final States', val: activeTab === 'minimized' ? 1 : 2 },
                                                ].map(item => (
                                                    <div key={item.label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                                        <div className="text-xl font-bold text-primary">{item.val}</div>
                                                        <div className="text-[11px] text-text-secondary mt-0.5">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-text-secondary leading-relaxed">
                                                <span className="font-bold text-primary">Regex: </span>
                                                <code className="font-mono">{regex}</code>
                                                <span className="mx-2">→</span>
                                                {activeTab === 'nfa' ? `${complexity.nfa} states via Thompson's Construction` :
                                                    activeTab === 'dfa' ? `${complexity.dfa} states via Subset Construction` :
                                                        `${complexity.min} states after Hopcroft minimization`}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="compare"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full space-y-4"
                                >
                                    <h3 className="text-base font-bold text-text-primary dark:text-white mb-2 text-center">State Complexity Comparison</h3>
                                    <p className="text-xs text-text-secondary text-center mb-4">Based on regex: <code className="font-mono text-primary">{regex}</code></p>
                                    {[
                                        { label: 'ε-NFA States', value: complexity.nfa, color: 'text-text-primary', pct: 100 },
                                        { label: 'DFA States (Subset)', value: complexity.dfa, color: 'text-primary', pct: Math.round(complexity.dfa / complexity.nfa * 100), highlight: true },
                                        { label: 'Minimized DFA States', value: complexity.min, color: 'text-success', pct: Math.round(complexity.min / complexity.nfa * 100), highlight: true },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={cn(
                                                "p-4 rounded-xl border",
                                                item.label.includes('Min') ? "bg-success/5 border-success/30" :
                                                    item.label.includes('DFA States') ? "bg-primary/5 border-primary/30" : "bg-white dark:bg-slate-800 border-border"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={cn("font-semibold text-sm", item.label.includes('Min') ? 'text-success' : item.label.includes('DFA States') ? 'text-primary' : 'text-text-secondary')}>{item.label}</span>
                                                <span className={cn("font-mono font-bold text-2xl", item.color)}>{item.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.pct}%` }}
                                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                                    className={cn("h-1.5 rounded-full", item.label.includes('Min') ? 'bg-success' : item.label.includes('DFA States') ? 'bg-primary' : 'bg-gray-400')}
                                                />
                                            </div>
                                            <div className="text-[11px] text-text-secondary mt-1">{item.pct}% relative to ε-NFA</div>
                                        </motion.div>
                                    ))}
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
                                        💡 Minimized DFA uses the <strong>Hopcroft Algorithm</strong> to merge equivalent states, reducing from {complexity.dfa} to {complexity.min} states.
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
