import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, ChevronRight, Search, FileText, Code2,
    Layers, GitBranch, ArrowRight, ArrowLeft,
    Network, Cpu, Zap, Shield, Menu, X
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ─── Documentation Content ───────────────────────────────────────────────────
const docsContent = {
    "Introduction": {
        toc: ["What is AutomataLab?", "Key Features", "Quick Tip"],
        render: () => (
            <div className="space-y-8">
                <p className="text-lg text-text-secondary leading-relaxed">
                    Welcome to <strong className="text-text-primary">AutomataLab</strong> — an interactive, browser-based platform for learning, building, and simulating Automata Theory and Formal Languages.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { icon: Network, title: "Visual Graph Editor", desc: "Draw and edit state transition graphs using React Flow." },
                        { icon: Zap, title: "Real-time Simulation", desc: "Instantly validate strings against your automata definition." },
                        { icon: Layers, title: "Four Core Modules", desc: "DFA/NFA, Regex, PDA, and CFG to CNF all in one place." },
                        { icon: Shield, title: "100% Client-Side", desc: "All computations run in your browser. No server needed." },
                    ].map(item => (
                        <div key={item.title} className="flex gap-4 p-4 rounded-xl border border-border bg-gray-50 dark:bg-slate-800/50">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <item.icon size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm mb-1">{item.title}</h3>
                                <p className="text-xs text-text-secondary">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Callout icon={GitBranch} title="Quick Tip">
                    Press <Kbd>CTRL + K</Kbd> anywhere in the app to open the Command Palette and instantly jump to any module or docs page.
                </Callout>
            </div>
        )
    },
    "Quick Start": {
        toc: ["Prerequisites", "Running Locally", "Project Structure"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">Get AutomataLab running on your machine in under 2 minutes.</p>
                <h2 id="prerequisites" className="doc-h2">Prerequisites</h2>
                <p className="text-text-secondary text-sm">You need the following installed on your system:</p>
                <ul className="list-disc ml-6 space-y-1 text-sm text-text-secondary">
                    <li>Node.js v18 or higher</li>
                    <li>npm v9 or higher</li>
                    <li>Git</li>
                </ul>
                <h2 id="running-locally" className="doc-h2">Running Locally</h2>
                <CodeBlock>{`# 1. Clone the repository
git clone https://github.com/your-repo/automatalab.git

# 2. Navigate to frontend directory
cd AutomataLab/frontend

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# App is now running at http://localhost:5173`}</CodeBlock>
                <h2 id="project-structure" className="doc-h2">Project Structure</h2>
                <CodeBlock>{`frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # DFA, Regex, PDA, CNF, About, Docs
│   ├── services/
│   │   └── simulation/ # dfaEngine.js, regexEngine.js, ...
│   ├── hooks/          # useTheme, etc.
│   └── utils/          # cn(), helpers
└── tailwind.config.js`}</CodeBlock>
            </div>
        )
    },
    "Architecture": {
        toc: ["Frontend", "Simulation Engines", "State Management"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">AutomataLab is a fully client-side Single Page Application (SPA) built on a modern React stack.</p>
                <h2 id="technology-stack" className="doc-h2">Technology Stack</h2>
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-text-secondary uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left border-b border-border">Layer</th>
                                <th className="px-4 py-3 text-left border-b border-border">Technology</th>
                                <th className="px-4 py-3 text-left border-b border-border">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[
                                ["UI Framework", "React 19", "Component-based UI"],
                                ["Bundler", "Vite 7", "Fast HMR dev server"],
                                ["Styling", "Tailwind CSS", "Utility-first CSS"],
                                ["Routing", "React Router v7", "Client-side navigation"],
                                ["Graph Viz", "React Flow (@xyflow)", "State diagram rendering"],
                                ["Animation", "Framer Motion", "Micro-animations"],
                                ["Icons", "Lucide React", "Consistent icon set"],
                            ].map(([layer, tech, purpose]) => (
                                <tr key={layer} className="bg-white dark:bg-card-dark">
                                    <td className="px-4 py-3 font-medium text-text-primary">{layer}</td>
                                    <td className="px-4 py-3 font-mono text-primary text-xs">{tech}</td>
                                    <td className="px-4 py-3 text-text-secondary">{purpose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <h2 id="simulation-engines" className="doc-h2">Simulation Engines</h2>
                <p className="text-text-secondary text-sm">All automata algorithms run in <strong>pure JavaScript</strong> inside the browser, inside <code className="text-primary text-xs bg-primary/10 px-1.5 py-0.5 rounded">src/services/simulation/</code>:</p>
                <CodeBlock>{`src/services/simulation/
├── dfaEngine.js    # DFA & NFA simulation (ε-closure, simulate())
├── regexEngine.js  # Regex validation & explanation
├── pdaEngine.js    # PDA BFS-based stack simulation
└── cfgEngine.js    # CFG to CNF 5-step conversion pipeline`}</CodeBlock>
            </div>
        )
    },
    "What is Automata?": {
        toc: ["Definition", "Types", "Why it matters"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">
                    An <strong className="text-text-primary">automaton</strong> (plural: automata) is an abstract mathematical model of a computing machine. It reads an input string symbol by symbol and transitions between states according to a set of rules, ultimately deciding whether to <strong>accept</strong> or <strong>reject</strong> the input.
                </p>
                <h2 id="formal-definition" className="doc-h2">Formal Definition</h2>
                <p className="text-text-secondary text-sm">A Deterministic Finite Automaton (DFA) is formally defined as a 5-tuple:</p>
                <div className="p-5 bg-gray-900 rounded-xl border border-border font-mono text-sm text-gray-200">
                    <p>M = (Q, Σ, δ, q₀, F)</p>
                    <div className="mt-3 space-y-1.5 text-gray-400 text-xs">
                        <p><span className="text-yellow-400">Q</span>    — finite set of states</p>
                        <p><span className="text-yellow-400">Σ</span>    — input alphabet (finite set of symbols)</p>
                        <p><span className="text-yellow-400">δ</span>    — transition function: Q × Σ → Q</p>
                        <p><span className="text-yellow-400">q₀</span>   — initial state (q₀ ∈ Q)</p>
                        <p><span className="text-yellow-400">F</span>    — set of final (accepting) states (F ⊆ Q)</p>
                    </div>
                </div>
                <Callout icon={GitBranch} title="Key Insight">
                    The difference between DFA and NFA is that in an NFA, the transition function δ can map a state and symbol to <em>multiple</em> next states (or none). Every NFA can be converted to an equivalent DFA using the Powerset Construction algorithm.
                </Callout>
            </div>
        )
    },
    "Formal Languages": {
        toc: ["Definition", "Operations", "Chomsky Levels"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">A <strong className="text-text-primary">formal language</strong> is a set of strings over a given alphabet Σ. The study of formal languages is central to compiler design, text processing, and theoretical computer science.</p>
                <h2 id="language-operations" className="doc-h2">Language Operations</h2>
                <div className="space-y-3">
                    {[
                        ["Union", "L₁ ∪ L₂", "All strings in L₁ or L₂ (or both)."],
                        ["Concatenation", "L₁ · L₂", "All strings formed by appending a string from L₂ to a string from L₁."],
                        ["Kleene Star", "L*", "Zero or more concatenations of strings from L, including the empty string ε."],
                        ["Complement", "L̄", "All strings over Σ that are NOT in L."],
                    ].map(([op, notation, desc]) => (
                        <div key={op} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white dark:bg-slate-800/30">
                            <div className="w-32 flex-shrink-0">
                                <span className="font-semibold text-text-primary text-sm">{op}</span>
                                <div className="font-mono text-primary text-xs mt-0.5">{notation}</div>
                            </div>
                            <p className="text-sm text-text-secondary">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    "Chomsky Hierarchy": {
        toc: ["Type 0–3", "Automata Correspondence", "Summary Table"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">
                    Noam Chomsky classified formal languages into four types based on the complexity of the grammar rules required to generate them.
                </p>
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-text-secondary uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left border-b border-border">Type</th>
                                <th className="px-4 py-3 text-left border-b border-border">Grammar</th>
                                <th className="px-4 py-3 text-left border-b border-border">Automaton</th>
                                <th className="px-4 py-3 text-left border-b border-border">Example</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[
                                ["Type 3", "Regular", "DFA / NFA", "a*b+"],
                                ["Type 2", "Context-Free", "Pushdown Automata", "aⁿbⁿ"],
                                ["Type 1", "Context-Sensitive", "Linear Bounded", "aⁿbⁿcⁿ"],
                                ["Type 0", "Unrestricted", "Turing Machine", "Halting Problem"],
                            ].map(([type, grammar, automaton, example]) => (
                                <tr key={type} className="bg-white dark:bg-card-dark">
                                    <td className="px-4 py-3 font-bold text-primary">{type}</td>
                                    <td className="px-4 py-3 text-text-primary font-medium">{grammar}</td>
                                    <td className="px-4 py-3 text-text-secondary">{automaton}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{example}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Callout icon={GitBranch} title="Key Insight">
                    Each type is a strict subset of the one above it. Every regular language is also context-free, but not vice versa. AutomataLab covers <strong>Type 3</strong> (DFA, NFA, Regex) and <strong>Type 2</strong> (PDA, CFG, CNF).
                </Callout>
            </div>
        )
    },
    "DFA Simulator": {
        toc: ["Overview", "How to Use", "Example"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">The DFA Simulator allows you to construct a Deterministic or Non-Deterministic Finite Automaton visually and test input strings against it in real time.</p>
                <h2 id="how-to-use" className="doc-h2">How to Use</h2>
                <ol className="space-y-4">
                    {[
                        ["Define the Alphabet (Σ)", "In the left panel, set the input alphabet. Use comma-separated symbols, e.g., a, b."],
                        ["Add States (Q)", "Click Add State to create new nodes. They will appear in the React Flow canvas. Drag them to arrange."],
                        ["Mark Final States", "Add ★ to a node's label to mark it as a final/accepting state. E.g., rename q1 to q1 ★."],
                        ["Connect States", "Drag from one node's handle to another to create a transition edge. A label dialog will appear."],
                        ["Run Simulation", "Type a test string in the Simulation box and click Run. The result and execution trace will appear at the bottom."],
                    ].map(([title, desc], i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
                                <p className="text-sm text-text-secondary mt-0.5">{desc}</p>
                            </div>
                        </div>
                    ))}
                </ol>
                <h2 id="example-strings-ending-in-abb" className="doc-h2">Example: Strings ending in 'abb'</h2>
                <CodeBlock>{`States (Q)   = { q0, q1 ★ }
Alphabet (Σ) = { a, b }
Initial State = q0
Final States  = { q1 }

Transitions (δ):
  q0 --a--> q1
  q0 --b--> q0
  q1 --a--> q1
  q1 --b--> q1

Test: "abba" → ACCEPTED (reaches q1)`}</CodeBlock>
            </div>
        )
    },
    "Regex Tester": {
        toc: ["Overview", "Regex Syntax", "Conversion Pipeline"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">The Regex Studio allows you to write Regular Expressions, test strings against them, and visualize the conversion pipeline from Regex → NFA → DFA → Minimized DFA.</p>
                <h2 id="supported-syntax" className="doc-h2">Supported Syntax</h2>
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-text-secondary uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left border-b border-border">Operator</th>
                                <th className="px-4 py-3 text-left border-b border-border">Symbol</th>
                                <th className="px-4 py-3 text-left border-b border-border">Example</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[
                                ["Union", "|", "a|b → matches 'a' or 'b'"],
                                ["Concatenation", "(implicit)", "ab → matches 'ab'"],
                                ["Kleene Star", "*", "a* → matches '', 'a', 'aa', ..."],
                                ["One or More", "+", "a+ → matches 'a', 'aa', ..."],
                                ["Optional", "?", "a? → matches '' or 'a'"],
                                ["Grouping", "()", "(ab)* → matches '', 'ab', 'abab', ..."],
                            ].map(([op, sym, ex]) => (
                                <tr key={op} className="bg-white dark:bg-card-dark">
                                    <td className="px-4 py-3 font-medium text-text-primary">{op}</td>
                                    <td className="px-4 py-3 font-mono text-primary font-bold">{sym}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{ex}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    },
    "PDA Builder": {
        toc: ["Overview", "How to Use", "Acceptance Modes"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">The PDA Builder simulates a Pushdown Automaton, which is a finite automaton augmented with an infinite stack memory — allowing it to recognize Context-Free Languages.</p>
                <h2 id="transition-function-format" className="doc-h2">Transition Function Format</h2>
                <p className="text-text-secondary text-sm">Each PDA transition is written as:</p>
                <div className="p-4 bg-gray-900 rounded-xl border border-border font-mono text-sm text-gray-200">
                    <p className="text-yellow-400">(currentState, inputSymbol, stackTop) → (nextState, pushSymbols)</p>
                    <div className="mt-3 text-gray-400 text-xs space-y-1">
                        <p>Example: (q0, a, Z0) → (q0, AZ0)</p>
                        <p>         — Read 'a', pop Z0, push AZ0 (push A on top of Z0)</p>
                        <p>Example: (q0, b, A) → (q1, ε)</p>
                        <p>         — Read 'b', pop A, push nothing (ε = empty)</p>
                    </div>
                </div>
                <h2 id="acceptance-modes" className="doc-h2">Acceptance Modes</h2>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5">
                        <h3 className="font-semibold text-success text-sm mb-1">Accept by Empty Stack</h3>
                        <p className="text-xs text-text-secondary">The PDA accepts an input string if, after consuming all input, the stack contains only the bottom-of-stack symbol Z₀ (or is completely empty).</p>
                    </div>
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <h3 className="font-semibold text-primary text-sm mb-1">Accept by Final State</h3>
                        <p className="text-xs text-text-secondary">The PDA accepts an input string if, after consuming all input, the current state is in the set of designated final states F.</p>
                    </div>
                </div>
            </div>
        )
    },
    "CFG to CNF": {
        toc: ["Overview", "5 Transformation Steps", "CNF Rules"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">The CFG to CNF Converter transforms any Context-Free Grammar into Chomsky Normal Form through a systematic 5-step process. CNF is required for algorithms like the CYK parsing algorithm.</p>
                <h2 id="the-5-transformation-steps" className="doc-h2">The 5 Transformation Steps</h2>
                <div className="space-y-3">
                    {[
                        ["Step 1", "Remove ε-Productions", "Find all nullable variables (X → ε). For every rule containing that variable, add a new rule without it. Remove X → ε."],
                        ["Step 2", "Remove Unit Productions", "Find all unit productions (A → B). Replace them with the transitive closure: substitute all rules that B can produce into A."],
                        ["Step 3", "Remove Useless Symbols", "Remove variables that cannot derive any terminal string (non-generating) and variables not reachable from the start symbol."],
                        ["Step 4", "Replace Terminals in Long Rules", "For every terminal 'a' appearing in a rule with length ≥ 2, introduce a new variable T_a → a and replace 'a' with T_a."],
                        ["Step 5", "Binary Conversion", "Break down rules with 3+ variables on the right into chains of binary rules using fresh intermediate variables."],
                    ].map(([step, title, desc]) => (
                        <div key={step} className="flex gap-4 p-4 rounded-xl border border-border bg-white dark:bg-slate-800/30">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg h-fit flex-shrink-0">{step}</span>
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm mb-1">{title}</h3>
                                <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <h2 id="cnf-rules" className="doc-h2">CNF Rules</h2>
                <p className="text-text-secondary text-sm">A grammar G is in Chomsky Normal Form if every production rule is of exactly one of these two forms:</p>
                <CodeBlock>{`A → BC    (exactly two non-terminals)
A → a     (exactly one terminal)

Where A, B, C are non-terminals and B ≠ S, C ≠ S
(the start symbol S cannot appear on the right-hand side)`}</CodeBlock>
            </div>
        )
    },
    "Endpoints": {
        toc: ["DFA Endpoints", "Response Format"],
        render: () => (
            <div className="space-y-8">
                <p className="text-text-secondary leading-relaxed">The AutomataLab REST API is built with Flask and follows standard RESTful conventions. All responses use a unified JSON envelope.</p>
                <h2 id="response-format" className="doc-h2">Response Format</h2>
                <CodeBlock>{`{
  "success": true | false,
  "message": "Human-readable description",
  "data": { ... } | null,
  "errors": null | ["error message"]
}`}</CodeBlock>
                <h2 id="dfa-endpoints" className="doc-h2">DFA Endpoints</h2>
                <div className="space-y-4">
                    {[
                        { method: "POST", path: "/api/v1/dfa/validate", desc: "Validates the structural integrity of a DFA definition." },
                        { method: "POST", path: "/api/v1/dfa/simulate", desc: "Simulates a DFA against an input string and returns the execution timeline." },
                    ].map(ep => (
                        <div key={ep.path} className="p-4 rounded-xl border border-border bg-white dark:bg-slate-800/30">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded-md">{ep.method}</span>
                                <code className="text-sm font-mono text-primary">{ep.path}</code>
                            </div>
                            <p className="text-xs text-text-secondary">{ep.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
};

// Default fallback for pages without specific content
const defaultContent = (section) => ({
    toc: ["Overview"],
    render: () => (
        <div className="space-y-6">
            <p className="text-text-secondary leading-relaxed">
                Documentation for <strong className="text-text-primary">{section}</strong> is being written. Please check back soon.
            </p>
            <div className="p-6 rounded-xl border border-dashed border-border bg-gray-50 dark:bg-slate-900/50 text-center">
                <FileText size={32} className="mx-auto text-text-secondary/40 mb-3" />
                <p className="text-sm text-text-secondary">This page is under construction.</p>
            </div>
        </div>
    )
});

// ─── Helper Components ────────────────────────────────────────────────────────
const Callout = ({ icon: Icon, title, children }) => (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Icon size={16} /> {title}
        </h3>
        <p className="text-sm text-text-primary leading-relaxed">{children}</p>
    </div>
);

const Kbd = ({ children }) => (
    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-border text-xs font-mono mx-0.5">{children}</kbd>
);

const CodeBlock = ({ children }) => (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-border">
        <pre className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre">{children}</pre>
    </div>
);

// ─── Sidebar Config ───────────────────────────────────────────────────────────
const docsMenu = [
    { title: "Getting Started", icon: Book, items: ["Introduction", "Quick Start", "Architecture"] },
    { title: "Automata Theory", icon: FileText, items: ["What is Automata?", "Formal Languages", "Chomsky Hierarchy"] },
    { title: "Modules", icon: Layers, items: ["DFA Simulator", "Regex Tester", "PDA Builder", "CFG to CNF"] },
    { title: "API Reference", icon: Code2, items: ["Endpoints"] },
];

const allItems = docsMenu.flatMap(g => g.items);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Documentation() {
    const [activeSection, setActiveSection] = useState("Introduction");
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filteredMenu = useMemo(() => {
        if (!searchQuery.trim()) return docsMenu;
        const q = searchQuery.toLowerCase();
        return docsMenu.map(g => ({
            ...g,
            items: g.items.filter(item => item.toLowerCase().includes(q))
        })).filter(g => g.items.length > 0);
    }, [searchQuery]);

    const currentIdx = allItems.indexOf(activeSection);
    const prevSection = currentIdx > 0 ? allItems[currentIdx - 1] : null;
    const nextSection = currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null;

    const pageData = docsContent[activeSection] || defaultContent(activeSection);
    const PageContent = pageData.render;
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden relative">

            {/* Mobile Header Toggle */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white dark:bg-card-dark flex-shrink-0 z-20">
                <span className="font-bold text-text-primary">Docs Navigation</span>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-gray-100 dark:bg-slate-800 text-text-secondary rounded-lg"
                >
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside className={cn(
                "fixed inset-y-16 left-0 z-40 w-64 md:w-60 flex-col flex-shrink-0 border-r border-border bg-gray-50 md:bg-gray-50/50 dark:bg-slate-900 md:dark:bg-slate-900/20 overflow-hidden transition-transform duration-300 md:static md:translate-x-0 h-[calc(100vh-64px)]",
                isMobileMenuOpen ? "translate-x-0 shadow-2xl flex" : "-translate-x-full md:flex hidden"
            )}>
                {/* Search */}
                <div className="p-3 border-b border-border flex-shrink-0">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            placeholder="Search docs..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-8 pr-3 bg-white dark:bg-slate-800 border border-border rounded-lg text-sm outline-none focus:border-primary transition-colors text-text-primary placeholder:text-text-secondary"
                        />
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-5">
                    {filteredMenu.map((group) => (
                        <div key={group.title}>
                            <h4 className="flex items-center gap-1.5 text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-2 px-1">
                                <group.icon size={12} className="text-primary" /> {group.title}
                            </h4>
                            <div className="space-y-0.5 ml-2 border-l border-border pl-2">
                                {group.items.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => { setActiveSection(item); setIsMobileMenuOpen(false); }}
                                        className={cn(
                                            "w-full text-left px-2.5 py-1.5 text-sm rounded-md transition-colors",
                                            activeSection === item
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center text-xs text-text-secondary mb-6 gap-1.5">
                        <span>Docs</span>
                        <ChevronRight size={13} />
                        <span className="text-primary font-medium">{activeSection}</span>
                    </div>

                    {/* Animated Page Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            <h1 className="text-3xl font-bold text-text-primary mb-8 leading-tight">{activeSection}</h1>
                            <PageContent />
                        </motion.div>
                    </AnimatePresence>

                    {/* Prev / Next Navigation */}
                    <div className="flex justify-between gap-4 mt-16 pt-8 border-t border-border">
                        {prevSection ? (
                            <button
                                onClick={() => setActiveSection(prevSection)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <ArrowLeft size={16} className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                                <div>
                                    <div className="text-[11px] text-text-secondary">Previous</div>
                                    <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{prevSection}</div>
                                </div>
                            </button>
                        ) : <div />}

                        {nextSection ? (
                            <button
                                onClick={() => setActiveSection(nextSection)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-right group ml-auto"
                            >
                                <div>
                                    <div className="text-[11px] text-text-secondary">Next</div>
                                    <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{nextSection}</div>
                                </div>
                                <ArrowRight size={16} className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                            </button>
                        ) : <div />}
                    </div>
                </div>
            </main>

            {/* Right TOC */}
            <aside className="hidden xl:flex flex-col w-52 flex-shrink-0 border-l border-border bg-gray-50/30 dark:bg-slate-900/10 overflow-y-auto">
                <div className="p-5">
                    <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-4">On this page</h4>
                    <nav className="space-y-1.5">
                        {pageData.toc.map(item => {
                            const id = item.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            return (
                                <a
                                    key={item}
                                    href={`#${id}`}
                                    className="block text-xs text-text-secondary hover:text-primary transition-colors py-0.5"
                                    onClick={e => {
                                        e.preventDefault();
                                        const el = document.getElementById(id);
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {item}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </div>
    );
}
