import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail, Code2, Users, Server, Database, BrainCircuit, Globe, Laptop, Rocket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/cards/Card';

const ArchitectNode = ({ title, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-soft-sm border border-border w-32 text-center"
    >
        <Icon size={24} className="text-primary" />
        <span className="text-xs font-semibold">{title}</span>
    </motion.div>
);

const RoadmapItem = ({ phase, title, items, status }) => (
    <div className="relative pl-8 pb-8 border-l-2 border-border last:pb-0">
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-primary" />
        <div className="mb-1">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Phase {phase}</span>
            <span className="ml-2 text-xs text-text-secondary">({status})</span>
        </div>
        <h3 className="text-h6 font-semibold text-text-primary mb-3">{title}</h3>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default function About() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden flex-center bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6"
                    >
                        <Globe size={14} /> About AutomataLab
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-display sm:text-[56px] font-bold font-heading text-text-primary leading-tight mb-6"
                    >
                        Democratizing Theoretical <br />Computer Science.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-body-lg text-text-secondary max-w-2xl mx-auto"
                    >
                        AutomataLab is an open-source, interactive learning platform designed to replace static textbooks with dynamic, visual simulations of complex formal languages and automata algorithms.
                    </motion.p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-h3 font-bold mb-4">Our Vision</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                            We believe that theoretical computer science doesn't have to be intimidating. By providing real-time visual feedback, students can grasp abstract mathematical concepts like Non-deterministic Finite Automata (NFA) or Chomsky Normal Form (CNF) exponentially faster.
                        </p>
                        <p className="text-text-secondary leading-relaxed">
                            Our goal is to become the standard academic tool utilized by universities worldwide for teaching Formal Languages and Automata Theory.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-primary/5 border-none shadow-none">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <a href="https://github.com/rizkihsn/tbo-capstone-301240071.git" target="_blank" rel="noreferrer" className="p-2 bg-gray-100 dark:bg-slate-800 rounded-md hover:text-primary transition-colors"><Github size={18} /></a>
                                    <a href="#" className="p-2 bg-gray-100 dark:bg-slate-800 rounded-md hover:text-primary transition-colors"><Twitter size={18} /></a>
                                    <a href="#" className="p-2 bg-gray-100 dark:bg-slate-800 rounded-md hover:text-primary transition-colors"><Mail size={18} /></a>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/5 border-none shadow-none">
                            <CardContent className="p-6">
                                <BrainCircuit className="text-secondary mb-4" size={32} />
                                <h3 className="font-semibold mb-2">Real-time Feedback</h3>
                                <p className="text-sm text-text-secondary">Instant string validation and stack tracking.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Software Architecture */}
            <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-h3 font-bold mb-4">Software Architecture</h2>
                    <p className="text-text-secondary mb-16 max-w-2xl mx-auto">
                        AutomataLab is built on a modern, scalable stack ensuring zero-latency client-side simulations with a robust Python backend for complex graph validations.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        <ArchitectNode title="React 19 + Vite" icon={Code2} delay={0.1} />
                        <div className="w-1 h-8 md:w-8 md:h-1 bg-border rounded" />
                        <ArchitectNode title="REST API" icon={Globe} delay={0.2} />
                        <div className="w-1 h-8 md:w-8 md:h-1 bg-border rounded" />
                        <ArchitectNode title="Flask Backend" icon={Server} delay={0.3} />
                        <div className="w-1 h-8 md:w-8 md:h-1 bg-border rounded" />
                        <ArchitectNode title="PostgreSQL" icon={Database} delay={0.4} />
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-h3 font-bold mb-12 text-center">Development Roadmap</h2>
                    <div className="ml-4 md:ml-0">
                        <RoadmapItem
                            phase="1"
                            status="Completed"
                            title="Core Simulation Engine"
                            items={[
                                "Interactive DFA & NFA Simulator",
                                "Basic Regex Tester",
                                "React Flow Graph Visualization"
                            ]}
                        />
                        <RoadmapItem
                            phase="2"
                            status="In Progress"
                            title="Advanced Algorithms"
                            items={[
                                "Pushdown Automata (PDA) Stack Visualizer",
                                "CFG to CNF Step-by-step Converter",
                                "DFA Minimization Visualizer"
                            ]}
                        />
                        <RoadmapItem
                            phase="3"
                            status="Planned"
                            title="Backend & Cloud Features"
                            items={[
                                "User Authentication & Profiles",
                                "Cloud Save for Automata Models",
                                "REST API for bulk validations"
                            ]}
                        />
                        <RoadmapItem
                            phase="4"
                            status="Planned"
                            title="AI Learning Assistant"
                            items={[
                                "AI-driven Regex explanation",
                                "Step-by-step hint system for PDA construction",
                                "Automated grading for academic assignments"
                            ]}
                        />
                    </div>
                </div>
            </section >
        </div >
    );
}
