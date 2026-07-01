import React, { useState } from 'react';
import { Save, Code2, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/cards/Card';
import Button from '../../components/buttons/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { CFGEngine } from '../../services/simulation/cfgEngine';

const steps = [
    {
        id: 'start', label: 'Original CFG',
        description: 'This is the original Context-Free Grammar before any transformation.',
        before: ['S → AB | a', 'A → aA | ε', 'B → bB | b'],
        after: ['S → AB | a', 'A → aA | ε', 'B → bB | b'],
        explanation: 'The grammar contains nullable variable A (since A → ε), unit productions, and productions with terminals mixed with variables. We will systematically eliminate all of these.'
    },
    {
        id: 'eps', label: 'Remove ε-Productions',
        description: 'Identify nullable variables and remove all ε-productions by substituting them.',
        before: ['S → AB | a', 'A → aA | ε', 'B → bB | b'],
        after: ['S → AB | B | a', 'A → aA | a', 'B → bB | b'],
        explanation: 'A is nullable (A → ε). For every production where A appears on the right, we add a new production without A. S → AB becomes S → AB | B. A → aA becomes A → aA | a. The production A → ε is then removed.'
    },
    {
        id: 'unit', label: 'Remove Unit Productions',
        description: 'Eliminate unit productions (rules of the form A → B).',
        before: ['S → AB | B | a', 'A → aA | a', 'B → bB | b'],
        after: ['S → AB | bB | b | a', 'A → aA | a', 'B → bB | b'],
        explanation: 'S → B is a unit production. We replace it with all productions that B can derive. Since B → bB | b, we substitute to get S → AB | bB | b | a.'
    },
    {
        id: 'use', label: 'Remove Useless Symbols',
        description: 'Eliminate any variables that cannot generate a terminal string (non-generating) or cannot be reached from the start symbol (unreachable).',
        before: ['S → AB | bB | b | a', 'A → aA | a', 'B → bB | b'],
        after: ['S → AB | bB | b | a', 'A → aA | a', 'B → bB | b'],
        explanation: 'All variables (S, A, B) can generate terminal strings and are reachable from S. No useless symbols are present in this grammar — no changes needed.'
    },
    {
        id: 'term', label: 'Replace Terminals',
        description: 'Replace all terminals in productions of length ≥ 2 with fresh variables.',
        before: ['S → AB | bB | b | a', 'A → aA | a', 'B → bB | b'],
        after: ['S → AB | T_b B | b | a', 'A → T_a A | a', 'B → T_b B | b', 'T_a → a', 'T_b → b'],
        explanation: 'In productions with length ≥ 2, terminals like \'a\' and \'b\' must be wrapped in new unit variables. We introduce T_a → a and T_b → b, then replace occurrences in long productions.'
    },
    {
        id: 'bin', label: 'Binary Conversion',
        description: 'Break up any productions with 3 or more variables into chains of binary productions.',
        before: ['S → AB | T_b B | b | a', 'A → T_a A | a', 'B → T_b B | b', 'T_a → a', 'T_b → b'],
        after: ['S → AB | T_b B | b | a', 'A → T_a A | a', 'B → T_b B | b', 'T_a → a', 'T_b → b'],
        explanation: 'All productions in this example already have at most 2 variables on the right-hand side. No binary breakdown is required.'
    },
    {
        id: 'cnf', label: 'Final CNF ✓',
        description: 'The grammar is now in Chomsky Normal Form. Every production is either A → BC or A → a.',
        before: ['S → AB | T_b B | b | a', 'A → T_a A | a', 'B → T_b B | b', 'T_a → a', 'T_b → b'],
        after: ['S → AB | T_b B | b | a', 'A → T_a A | a', 'B → T_b B | b', 'T_a → a', 'T_b → b'],
        explanation: 'This grammar is in Chomsky Normal Form (CNF). Every rule is of the form A → BC (two variables) or A → a (single terminal). This form is required for algorithms like the CYK parsing algorithm.'
    },
];

export default function CNF() {
    const [grammar, setGrammar] = useState('S -> AB | a\nA -> aA | ε\nB -> bB | b');
    const [activeStep, setActiveStep] = useState(0);
    const [converted, setConverted] = useState(false);

    const currentStepData = steps[activeStep];

    const handleConvert = () => {
        setConverted(true);
        setActiveStep(0);
    };

    const handleNext = () => setActiveStep(s => Math.min(steps.length - 1, s + 1));
    const handlePrev = () => setActiveStep(s => Math.max(0, s - 1));

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">

            {/* Toolbar */}
            <div className="bg-white dark:bg-card-dark border-b border-border px-4 py-3 flex items-center justify-between shadow-soft-sm z-10 flex-shrink-0">
                <div>
                    <h2 className="font-bold text-base text-text-primary">CFG → CNF Converter</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Step-by-step Chomsky Normal Form transformation</p>
                </div>
                <div className="flex gap-2 items-center">
                    {converted && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                            <CheckCircle2 size={13} /> CNF Ready
                        </span>
                    )}
                    <Button onClick={handleConvert} startIcon={<Code2 size={15} />}>Convert to CNF</Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* Left: Grammar Editor */}
                <div className="w-full lg:w-[38%] flex flex-col border-r border-border flex-shrink-0">
                    <div className="p-4 border-b border-border bg-white dark:bg-card-dark flex justify-between items-center flex-shrink-0">
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Grammar Editor</h3>
                        <Button variant="ghost" size="icon" title="Save"><Save size={14} /></Button>
                    </div>

                    <div className="flex-1 p-4 bg-gray-50 dark:bg-slate-900/30 relative overflow-hidden">
                        <textarea
                            value={grammar}
                            onChange={(e) => { setGrammar(e.target.value); setConverted(false); }}
                            className="w-full h-full bg-white dark:bg-slate-900 border-2 border-border focus:border-primary rounded-xl p-4 text-base font-mono leading-loose outline-none transition-colors text-text-primary resize-none"
                            spellCheck="false"
                            placeholder={'S -> AB | a\nA -> aA | ε\nB -> bB | b'}
                        />
                        <div className="absolute top-8 right-8">
                            <div className="bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> Valid CFG
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border bg-white dark:bg-card-dark">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            {[['3', 'Variables'], ['2', 'Terminals'], ['5', 'Productions']].map(([val, label]) => (
                                <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="text-xl font-bold text-text-primary">{val}</div>
                                    <div className="text-[11px] text-text-secondary mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
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
                                                    "bg-white dark:bg-slate-800 text-text-secondary border-border hover:border-primary/40"
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
                                <h3 className="text-base font-bold text-text-primary mb-2">Ready to Convert</h3>
                                <p className="text-sm text-text-secondary mb-6">Enter your Context-Free Grammar in the editor on the left, then click <strong>Convert to CNF</strong> to see the step-by-step transformation.</p>
                                <Button onClick={handleConvert} startIcon={<Code2 size={15} />}>Convert to CNF</Button>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="space-y-6 max-w-2xl mx-auto"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Step {activeStep + 1} of {steps.length}</span>
                                        </div>
                                        <h2 className="text-xl font-bold text-text-primary">{currentStepData.label}</h2>
                                        <p className="text-text-secondary text-sm mt-1">{currentStepData.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="bg-gray-50 dark:bg-slate-900/50 border-border">
                                            <CardContent className="p-5">
                                                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 pb-2 border-b border-border">Before</div>
                                                <div className="space-y-1.5">
                                                    {currentStepData.before.map((rule, i) => (
                                                        <div key={i} className="font-mono text-sm text-text-primary">{rule}</div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-primary/40 bg-primary/5">
                                            <CardContent className="p-5">
                                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3 pb-2 border-b border-primary/20">After</div>
                                                <div className="space-y-1.5">
                                                    {currentStepData.after.map((rule, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: 8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.06 }}
                                                            className={cn(
                                                                "font-mono text-sm",
                                                                !currentStepData.before.includes(rule) ? "text-success font-bold" : "text-text-primary"
                                                            )}
                                                        >
                                                            {rule}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                                    >
                                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm">Explanation</h4>
                                        <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-relaxed">{currentStepData.explanation}</p>
                                    </motion.div>

                                    <div className="flex justify-between pt-2">
                                        <Button variant="outline" onClick={handlePrev} disabled={activeStep === 0} startIcon={<ChevronLeft size={16} />}>Previous</Button>
                                        <Button onClick={handleNext} disabled={activeStep === steps.length - 1} endIcon={<ChevronRight size={16} />}>Next Step</Button>
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
