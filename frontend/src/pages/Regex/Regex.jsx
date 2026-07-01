import React, { useState } from 'react';
import { Play, RotateCcw, GitMerge, Network, Download, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/cards/Card';
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

export default function Regex() {
    const [regex, setRegex] = useState('(a|b)*abb');
    const [testString, setTestString] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [activeTab, setActiveTab] = useState('nfa');
    const [validationMsg, setValidationMsg] = useState({ valid: true, msg: 'Valid syntax' });

    const handleRegexChange = (val) => {
        setRegex(val);
        const engine = new RegexEngine(val);
        const result = engine.validate();
        setValidationMsg({ valid: result.isValid, msg: result.isValid ? 'Valid syntax' : result.errors[0] });
    };

    const handleTestString = () => {
        if (!testString.trim()) return;
        // Use the native JS RegExp as the ground truth matcher (for demo purposes)
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

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">

            {/* Top Toolbar */}
            <div className="bg-white dark:bg-card-dark border-b border-border px-4 py-3 flex items-center justify-between shadow-soft-sm z-10">
                <div>
                    <h2 className="font-bold text-base text-text-primary">Regex Studio</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Write, test, and convert Regular Expressions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" startIcon={<Download size={13} />}>Export</Button>
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
                                className="w-full h-14 bg-gray-50 dark:bg-slate-900 border-2 border-border focus:border-primary rounded-xl px-4 pr-28 text-xl font-mono tracking-wider outline-none transition-colors text-text-primary"
                                spellCheck="false"
                                placeholder="e.g. (a|b)*abb"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                                className="flex-1 h-10 px-3 bg-white dark:bg-slate-900 border border-border rounded-lg font-mono text-sm outline-none focus:border-primary transition-colors text-text-primary"
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
                                            <span className="font-mono text-sm text-text-primary">{r.string}</span>
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
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC] dark:bg-[#0F172A] overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activeTab !== 'compare' ? (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-center max-w-sm"
                                >
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Network size={32} className="text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-text-primary mb-2">
                                        {activeTab === 'nfa' ? 'Thompson\'s Construction' : activeTab === 'dfa' ? 'Subset Construction' : 'Table-Filling Method'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-6">
                                        Click convert to generate the <strong>{activeTab.toUpperCase()}</strong> graph from the regex above.
                                    </p>
                                    <Button startIcon={<GitMerge size={16} />} onClick={() => alert(`Conversion to ${activeTab.toUpperCase()} would be rendered here using React Flow.`)}>
                                        Convert to {activeTab.toUpperCase()}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="compare"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full max-w-md space-y-3"
                                >
                                    <h3 className="text-base font-bold text-text-primary mb-5 text-center">State Complexity Comparison</h3>
                                    {[
                                        { label: 'ε-NFA States', value: 11, color: 'text-text-primary' },
                                        { label: 'DFA States', value: 5, color: 'text-text-primary' },
                                        { label: 'Minimized DFA States', value: 4, color: 'text-primary', highlight: true },
                                    ].map(item => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border",
                                                item.highlight ? "bg-primary/5 border-primary/30" : "bg-white dark:bg-slate-800 border-border"
                                            )}
                                        >
                                            <span className={cn("font-semibold text-sm", item.highlight ? "text-primary" : "text-text-secondary")}>{item.label}</span>
                                            <span className={cn("font-mono font-bold text-2xl", item.color)}>{item.value}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
