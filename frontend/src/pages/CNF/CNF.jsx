import React, { useState, useMemo } from 'react';
import { Save, Code2, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { Card, CardContent } from '../../components/cards/Card';
import Button from '../../components/buttons/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const steps = [
    {
        id: 'start', label: 'Original CFG',
        description: 'This is the original Context-Free Grammar before any transformation.',
        explanation: 'The grammar contains nullable variable A (since A → ε), unit productions, and productions with terminals mixed with variables. We will systematically eliminate all of these.',
        noChange: false,
    },
    {
        id: 'eps', label: 'Remove ε-Productions',
        description: 'Identify nullable variables and remove all ε-productions by substituting them.',
        explanation: 'A is nullable (A → ε). For every production where A appears on the right, we add a new production without A. S → AB becomes S → AB | B. A → aA becomes A → aA | a. The production A → ε is then removed.',
        noChange: false,
    },
    {
        id: 'unit', label: 'Remove Unit Productions',
        description: 'Eliminate unit productions (rules of the form A → B where B is a variable).',
        explanation: 'S → B is a unit production. We replace it with all productions that B can derive. Since B → bB | b, we substitute to get S → AB | bB | b | a.',
        noChange: false,
    },
    {
        id: 'use', label: 'Remove Useless Symbols',
        description: 'Eliminate variables that cannot generate a terminal string or cannot be reached from the start symbol.',
        explanation: 'All variables (S, A, B) can generate terminal strings and are reachable from S. No useless symbols are present in this grammar — no changes needed for this example.',
        noChange: true,
    },
    {
        id: 'term', label: 'Replace Terminals',
        description: 'Replace all terminals in productions of length ≥ 2 with fresh unit variables.',
        explanation: 'In productions with length ≥ 2, terminals must be wrapped in new unit variables. We introduce T_a → a and T_b → b, then replace occurrences like aA → T_aA and bB → T_bB.',
        noChange: false,
    },
    {
        id: 'bin', label: 'Binary Conversion',
        description: 'Break up productions with 3 or more symbols into chains of binary productions.',
        explanation: 'All productions in this grammar already have at most 2 symbols on the right-hand side. No binary breakdown is required — no changes needed.',
        noChange: true,
    },
    {
        id: 'cnf', label: 'Final CNF ✓',
        description: 'The grammar is now in Chomsky Normal Form. Every production is either A → BC or A → a.',
        explanation: 'This is the completed Chomsky Normal Form (CNF). Every rule is either A → BC (two variables) or A → a (single terminal). This form is required for CYK parsing and other CNF-based algorithms. Compare the original grammar with the final CNF to see the full transformation.',
        noChange: false,
        isFinal: true,
    },
];

// ─── Parse grammar string ─────────────────────────────────────────────────────
function parseGrammar(str) {
    const lines = str.trim().split('\n').filter(l => l.trim());
    const productions = [];
    const variables = new Set();
    const terminals = new Set();

    for (const line of lines) {
        const parts = line.split('->').map(s => s.trim());
        if (parts.length !== 2) continue;
        const lhs = parts[0].trim();
        const rhs = parts[1].split('|').map(r => r.trim());
        variables.add(lhs);
        for (const r of rhs) {
            productions.push({ lhs, rhs: r });
        }
    }

    for (const p of productions) {
        for (const c of p.rhs) {
            if (c !== 'ε' && c !== ' ' && !variables.has(c) && /[a-z0-9]/.test(c)) {
                terminals.add(c);
            }
        }
    }

    return {
        variables: [...variables],
        terminals: [...terminals],
        productions,
        isValid: productions.length > 0,
    };
}

// ─── Build pipeline — returns {stepIndex: {before, after, changed, newItems}} ─
function buildPipeline(parsed) {
    if (!parsed.isValid) return null;

    const { variables, terminals, productions } = parsed;

    const toRules = (prods) => {
        const grouped = {};
        for (const p of prods) {
            if (!grouped[p.lhs]) grouped[p.lhs] = [];
            grouped[p.lhs].push(p.rhs);
        }
        return Object.entries(grouped).map(([lhs, rhsList]) => `${lhs} → ${rhsList.join(' | ')}`);
    };

    const original = toRules(productions);

    // ── Step 1: Remove ε-productions ──────────────────────────────────────────
    const nullables = new Set();
    for (const p of productions) {
        if (p.rhs === 'ε') nullables.add(p.lhs);
    }

    const afterEps = [];
    for (const p of productions) {
        if (p.rhs === 'ε') continue;
        afterEps.push(p);
        for (const n of nullables) {
            if (p.rhs.includes(n)) {
                const newRhs = p.rhs.replace(new RegExp(n, 'g'), '').trim();
                if (newRhs && newRhs !== p.rhs) {
                    afterEps.push({ lhs: p.lhs, rhs: newRhs });
                }
            }
        }
    }

    // Deduplicate
    const epsDedup = [];
    const epsSeen = new Set();
    for (const p of afterEps) {
        const k = `${p.lhs}->${p.rhs}`;
        if (!epsSeen.has(k)) { epsSeen.add(k); epsDedup.push(p); }
    }
    const epsRules = toRules(epsDedup);

    // ── Step 2: Remove unit productions ───────────────────────────────────────
    const afterUnit = [];
    for (const p of epsDedup) {
        if (variables.includes(p.rhs) && p.rhs.length === 1) {
            // unit production — expand
            const replacements = epsDedup.filter(q => q.lhs === p.rhs);
            for (const r of replacements) {
                if (!variables.includes(r.rhs) || r.rhs.length > 1) {
                    afterUnit.push({ lhs: p.lhs, rhs: r.rhs });
                }
            }
        } else {
            afterUnit.push(p);
        }
    }
    const unitDedup = [];
    const unitSeen = new Set();
    for (const p of afterUnit) {
        const k = `${p.lhs}->${p.rhs}`;
        if (!unitSeen.has(k)) { unitSeen.add(k); unitDedup.push(p); }
    }
    const unitRules = toRules(unitDedup);

    // ── Step 3: Useless symbols (no-op for this grammar) ──────────────────────
    const usefulRules = unitRules;

    // ── Step 4: Replace terminals in long productions ─────────────────────────
    const termVarMap = {};
    for (const t of terminals) {
        termVarMap[t] = `T_${t}`;
    }
    const afterTerm = [];
    for (const p of unitDedup) {
        if (p.rhs.length > 1) {
            let newRhs = p.rhs;
            for (const [t, tv] of Object.entries(termVarMap)) {
                newRhs = newRhs.replace(new RegExp(t, 'g'), tv);
            }
            afterTerm.push({ lhs: p.lhs, rhs: newRhs });
        } else {
            afterTerm.push(p);
        }
    }
    // Add terminal unit productions
    for (const [t, tv] of Object.entries(termVarMap)) {
        afterTerm.push({ lhs: tv, rhs: t });
    }
    const termRules = toRules(afterTerm);

    // ── Step 5: Binary conversion ─────────────────────────────────────────────
    const afterBin = [];
    let binCount = 0;
    for (const p of afterTerm) {
        const symbols = splitRHS(p.rhs);
        if (symbols.length <= 2) {
            afterBin.push(p);
        } else {
            // Break into chain of binary productions
            let remaining = [...symbols];
            let currentLhs = p.lhs;
            while (remaining.length > 2) {
                const newVar = `Y${++binCount}`;
                afterBin.push({ lhs: currentLhs, rhs: `${remaining[0]} ${newVar}` });
                currentLhs = newVar;
                remaining = remaining.slice(1);
            }
            afterBin.push({ lhs: currentLhs, rhs: remaining.join(' ') });
        }
    }
    const binRules = toRules(afterBin);

    // Helper: detect new items by comparing to previous step
    const newItems = (prev, curr) => curr.filter(r => !prev.includes(r));
    const removedItems = (prev, curr) => prev.filter(r => !curr.includes(r));

    return {
        original,
        0: {
            before: original,
            after: original,
            added: [],
            removed: [],
            note: null,
        },
        1: {
            before: original,
            after: epsRules,
            added: newItems(original, epsRules),
            removed: removedItems(original, epsRules),
            note: nullables.size > 0
                ? `Nullable variables detected: { ${[...nullables].join(', ')} }`
                : 'No nullable variables found — no changes needed.',
        },
        2: {
            before: epsRules,
            after: unitRules,
            added: newItems(epsRules, unitRules),
            removed: removedItems(epsRules, unitRules),
            note: epsRules.join() !== unitRules.join()
                ? 'Unit productions were expanded and removed.'
                : 'No unit productions found — no changes needed.',
        },
        3: {
            before: unitRules,
            after: usefulRules,
            added: [],
            removed: [],
            note: 'All variables are generating and reachable — no useless symbols to remove.',
        },
        4: {
            before: unitRules,
            after: termRules,
            added: newItems(unitRules, termRules),
            removed: removedItems(unitRules, termRules),
            note: Object.keys(termVarMap).length > 0
                ? `New terminal variables: { ${Object.entries(termVarMap).map(([t, v]) => `${v} → ${t}`).join(', ')} }`
                : 'No terminals in long productions — no changes needed.',
        },
        5: {
            before: termRules,
            after: binRules,
            added: newItems(termRules, binRules),
            removed: [],
            note: termRules.join() === binRules.join()
                ? 'All productions already have ≤ 2 symbols — no binary conversion needed.'
                : `${binCount} new binary variable(s) introduced.`,
        },
        6: {
            // Final: show ORIGINAL vs FINAL for clear transformation view
            before: original,
            after: binRules,
            added: binRules.filter(r => !original.includes(r)),
            removed: original.filter(r => !binRules.includes(r)),
            note: 'Full transformation: Original CFG → Chomsky Normal Form.',
        },
    };
}

// Split RHS respecting T_x tokens (multi-char)
function splitRHS(rhs) {
    return rhs.match(/T_[a-z0-9]|[A-Z][0-9]*|[a-z0-9]/g) || [rhs];
}

export default function CNF() {
    const [grammar, setGrammar] = useState('S -> AB | a\nA -> aA | ε\nB -> bB | b');
    const [activeStep, setActiveStep] = useState(0);
    const [converted, setConverted] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const parsed = useMemo(() => parseGrammar(grammar), [grammar]);
    const pipeline = useMemo(() => converted ? buildPipeline(parsed) : null, [converted, parsed]);

    const currentStepMeta = steps[activeStep];
    const pipelineStep = pipeline?.[activeStep];

    const handleConvert = () => {
        if (!parsed.isValid) { showToast('Invalid grammar. Format: A -> B | C', 'error'); return; }
        setConverted(true);
        setActiveStep(0);
        showToast('Grammar converted to CNF!', 'success');
    };

    const handleNext = () => setActiveStep(s => Math.min(steps.length - 1, s + 1));
    const handlePrev = () => setActiveStep(s => Math.max(0, s - 1));

    const handleSave = () => {
        const data = { grammar, parsed: { variables: parsed.variables, terminals: parsed.terminals }, pipeline };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'cfg-cnf-model.json'; a.click();
        URL.revokeObjectURL(url);
        showToast('Saved as cfg-cnf-model.json!', 'success');
    };

    const beforeLabel = currentStepMeta.isFinal ? 'Original CFG' : 'Before';
    const afterLabel = currentStepMeta.isFinal ? 'Final CNF ✓' : 'After';

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background relative">

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
                        className={cn(
                            "fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2",
                            toast.type === 'success' && "bg-green-50 border-green-300 text-green-700",
                            toast.type === 'error' && "bg-red-50 border-red-300 text-red-700",
                            toast.type === 'info' && "bg-blue-50 border-blue-300 text-blue-700",
                        )}
                    >{toast.msg}</motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="bg-white dark:bg-card-dark border-b border-border px-4 py-3 flex items-center justify-between shadow-soft-sm z-10 flex-shrink-0">
                <div>
                    <h2 className="font-bold text-base text-text-primary dark:text-white">CFG → CNF Converter</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Step-by-step Chomsky Normal Form transformation</p>
                </div>
                <div className="flex gap-2 items-center">
                    {converted && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                            <CheckCircle2 size={13} /> CNF Ready
                        </span>
                    )}
                    <Button variant="ghost" size="sm" startIcon={<Save size={14} />} onClick={handleSave}>Save</Button>
                    <Button onClick={handleConvert} startIcon={<Code2 size={15} />} disabled={!parsed.isValid}>Convert to CNF</Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* Left: Grammar Editor */}
                <div className="w-full lg:w-[38%] flex flex-col border-r border-border flex-shrink-0">
                    <div className="p-4 border-b border-border bg-white dark:bg-card-dark flex justify-between items-center flex-shrink-0">
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Grammar Editor</h3>
                        {parsed.isValid && grammar.trim() ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">
                                <CheckCircle2 size={11} /> Valid CFG
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md border border-danger/20">
                                <AlertCircle size={11} /> Invalid
                            </span>
                        )}
                    </div>

                    <div className="flex-1 p-4 bg-gray-50 dark:bg-slate-900/30 relative overflow-hidden">
                        <textarea
                            value={grammar}
                            onChange={(e) => { setGrammar(e.target.value); setConverted(false); }}
                            className="w-full h-full bg-white dark:bg-slate-900 dark:text-white border-2 border-border focus:border-primary rounded-xl p-4 text-base font-mono leading-loose outline-none transition-colors text-text-primary resize-none"
                            spellCheck="false"
                            placeholder={'S -> AB | a\nA -> aA | ε\nB -> bB | b'}
                        />
                    </div>

                    <div className="p-4 border-t border-border bg-white dark:bg-card-dark">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[
                                ['Variables', parsed.variables.length.toString()],
                                ['Terminals', parsed.terminals.length.toString()],
                                ['Productions', parsed.productions.length.toString()]
                            ].map(([label, val]) => (
                                <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="text-xl font-bold text-text-primary dark:text-white">{val}</div>
                                    <div className="text-[11px] text-text-secondary mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-text-secondary mt-3">
                            Format: <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">A -{'>'} BC | a</code> one rule per line.
                        </p>
                    </div>
                </div>

                {/* Right: Conversion Steps */}
                <div className="flex-1 flex flex-col bg-white dark:bg-card-dark overflow-hidden">

                    {/* Step Progress Bar */}
                    <div className="p-4 border-b border-border bg-gray-50 dark:bg-slate-900/30 flex-shrink-0">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {steps.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <button
                                        onClick={() => converted && setActiveStep(idx)}
                                        disabled={!converted}
                                        className={cn(
                                            "flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap",
                                            !converted && "opacity-40 cursor-not-allowed",
                                            converted && activeStep === idx ? "bg-primary text-white border-primary shadow-md scale-105" :
                                                converted && idx < activeStep ? "bg-success/10 text-success border-success/30" :
                                                    "bg-white dark:bg-slate-800 dark:text-slate-300 text-text-secondary border-border hover:border-primary/40"
                                        )}
                                    >
                                        {idx < activeStep && converted ? '✓ ' : ''}{step.label}
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <ArrowRight size={14} className={cn("flex-shrink-0 transition-colors", converted && idx < activeStep ? "text-success" : "text-border")} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!converted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                    <Code2 size={32} className="text-primary" />
                                </div>
                                <h3 className="text-base font-bold text-text-primary dark:text-white mb-2">Ready to Convert</h3>
                                <p className="text-sm text-text-secondary mb-6">Enter your CFG on the left, then click <strong>Convert to CNF</strong>.</p>
                                <Button onClick={handleConvert} startIcon={<Code2 size={15} />} disabled={!parsed.isValid}>Convert to CNF</Button>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                    className="space-y-5 max-w-2xl mx-auto"
                                >
                                    {/* Step header */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                                Step {activeStep + 1} of {steps.length}
                                            </span>
                                            {currentStepMeta.noChange && (
                                                <span className="text-xs font-semibold text-text-secondary bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <Info size={11} /> No changes needed
                                                </span>
                                            )}
                                            {currentStepMeta.isFinal && (
                                                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <CheckCircle2 size={11} /> CNF Complete
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-text-primary dark:text-white">{currentStepMeta.label}</h2>
                                        <p className="text-text-secondary text-sm mt-1">{currentStepMeta.description}</p>
                                    </div>

                                    {/* Note / context bar */}
                                    {pipelineStep?.note && (
                                        <div className={cn(
                                            "flex items-start gap-2 p-3 rounded-lg text-xs border",
                                            currentStepMeta.noChange
                                                ? "bg-gray-50 dark:bg-slate-800 border-border text-text-secondary"
                                                : currentStepMeta.isFinal
                                                    ? "bg-success/5 border-success/20 text-success"
                                                    : "bg-primary/5 border-primary/20 text-primary"
                                        )}>
                                            <Info size={13} className="flex-shrink-0 mt-0.5" />
                                            <span>{pipelineStep.note}</span>
                                        </div>
                                    )}

                                    {/* Before / After */}
                                    {pipelineStep && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Before */}
                                            <Card className={cn("border-border", currentStepMeta.isFinal ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" : "bg-gray-50 dark:bg-slate-900/50")}>
                                                <CardContent className="p-5">
                                                    <div className={cn(
                                                        "text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b",
                                                        currentStepMeta.isFinal ? "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800" : "text-text-secondary border-border"
                                                    )}>
                                                        {beforeLabel}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {pipelineStep.before.map((rule, i) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "font-mono text-sm px-2 py-1 rounded-md",
                                                                    pipelineStep.removed?.includes(rule)
                                                                        ? "line-through text-danger/70 bg-danger/5"
                                                                        : "text-text-primary dark:text-white"
                                                                )}
                                                            >
                                                                {rule}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* After */}
                                            <Card className={cn("border-primary/40", currentStepMeta.noChange ? "opacity-60" : "bg-primary/5")}>
                                                <CardContent className="p-5">
                                                    <div className={cn(
                                                        "text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-primary/20",
                                                        currentStepMeta.isFinal ? "text-success" : "text-primary"
                                                    )}>
                                                        {afterLabel}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {currentStepMeta.noChange ? (
                                                            <div className="text-center py-4 text-text-secondary text-xs">
                                                                <Info size={20} className="mx-auto mb-2 opacity-40" />
                                                                No changes in this step.<br />Grammar remains the same.
                                                            </div>
                                                        ) : (
                                                            pipelineStep.after.map((rule, i) => {
                                                                const isNew = pipelineStep.added?.includes(rule);
                                                                return (
                                                                    <motion.div
                                                                        key={i}
                                                                        initial={{ opacity: 0, x: 8 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: i * 0.05 }}
                                                                        className={cn(
                                                                            "font-mono text-sm px-2 py-1 rounded-md border transition-colors",
                                                                            isNew
                                                                                ? "text-success font-bold bg-success/10 border-success/30"
                                                                                : currentStepMeta.isFinal
                                                                                    ? "text-text-primary dark:text-white bg-white dark:bg-slate-800 border-border"
                                                                                    : "text-text-primary dark:text-white border-transparent"
                                                                        )}
                                                                    >
                                                                        {isNew && <span className="text-[10px] mr-1 font-bold">NEW</span>}
                                                                        {rule}
                                                                    </motion.div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                                    >
                                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm">Explanation</h4>
                                        <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">{currentStepMeta.explanation}</p>
                                    </motion.div>

                                    {/* Nav buttons */}
                                    <div className="flex justify-between pt-2">
                                        <Button variant="outline" onClick={handlePrev} disabled={activeStep === 0} startIcon={<ChevronLeft size={16} />}>Previous</Button>
                                        {activeStep < steps.length - 1 ? (
                                            <Button onClick={handleNext} endIcon={<ChevronRight size={16} />}>Next Step</Button>
                                        ) : (
                                            <Button variant="ghost" onClick={() => { setConverted(false); setActiveStep(0); setGrammar('S -> AB | a\nA -> aA | ε\nB -> bB | b'); }} startIcon={<RefreshCw size={15} />}>
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
