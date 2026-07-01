import { Network, Code, Layers, Cpu } from 'lucide-react';

export const homeFeatures = [
    {
        id: 'dfa-sim',
        icon: Network,
        title: "DFA Simulator",
        description: "Build and simulate Deterministic Finite Automata visually with a drag-and-drop node editor.",
        to: "/dfa",
        delay: 0.1
    },
    {
        id: 'regex-test',
        icon: Code,
        title: "Regex Tester",
        description: "Test and visualize Regular Expressions with real-time matching and syntax highlighting.",
        to: "/regex",
        delay: 0.2
    },
    {
        id: 'pda-build',
        icon: Layers,
        title: "PDA Builder",
        description: "Design Pushdown Automata to parse context-free languages with interactive stack visualization.",
        to: "/pda",
        delay: 0.3
    },
    {
        id: 'cnf-conv',
        icon: Cpu,
        title: "CNF Converter",
        description: "Step-by-step conversion of Context-Free Grammars to Chomsky Normal Form.",
        to: "/cnf",
        delay: 0.4
    }
];
