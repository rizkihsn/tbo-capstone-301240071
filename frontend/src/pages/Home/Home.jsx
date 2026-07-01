import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Cpu, Code, Network, Layers, Sparkles,
    Book, Github, CheckCircle2, ChevronDown, Play, Clock, BarChart
} from 'lucide-react';
import Button from '../../components/buttons/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/cards/Card';
import { cn } from '../../utils/cn';

const FeatureCard = ({ icon: Icon, title, description, to, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
    >
        <Link to={to} className="block group">
            <Card hoverable className="h-full border-border/50 group-hover:border-primary/50 transition-colors">
                <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={24} />
                    </div>
                    <CardTitle className="text-h6">{title}</CardTitle>
                    <CardDescription className="text-small mt-2">
                        {description}
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    </motion.div>
);

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-border last:border-0">
            <button
                className="flex justify-between items-center w-full py-4 text-left focus:outline-none"
                onClick={onClick}
            >
                <span className="font-medium text-text-primary dark:text-white">{question}</span>
                <ChevronDown
                    className={cn(
                        "text-text-secondary dark:text-slate-300 transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                    size={20}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-text-secondary dark:text-slate-300 text-sm leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatisticItem = ({ value, label }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center p-6"
    >
        <div className="text-4xl md:text-5xl font-bold font-heading text-text-primary dark:text-white mb-2">{value}</div>
        <div className="text-sm font-medium text-text-secondary dark:text-slate-300 uppercase tracking-wider">{label}</div>
    </motion.div>
);

const TestimonialCard = ({ name, role, university, comment, avatar }) => (
    <Card className="h-full bg-white dark:bg-card-dark border-border">
        <CardContent className="p-6">
            <div className="flex gap-1 mb-4 text-warning">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-text-secondary dark:text-slate-300 text-sm italic mb-6">"{comment}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {avatar}
                </div>
                <div>
                    <h4 className="font-semibold text-text-primary dark:text-white text-sm">{name}</h4>
                    <p className="text-xs text-text-secondary dark:text-slate-300">{role}, {university}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const Star = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);


const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const faqs = [
    { q: "What is AutomataLab?", a: "AutomataLab is a premium, interactive educational platform designed to visualize and simulate formal languages and automata theory concepts." },
    { q: "Do I need to install anything?", a: "No! AutomataLab is 100% web-based. All simulations run directly in your browser with zero latency." },
    { q: "Is it free to use?", a: "Yes, the core educational modules are completely free for students, educators, and researchers." },
    { q: "Can I export my graphs?", a: "Absolutely. You can export any DFA, NFA, or PDA graph as a JSON model or a high-quality PNG/SVG image for your assignments." },
];

export default function Home() {
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-4 pb-12 lg:pt-8 lg:pb-24 overflow-hidden flex-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl opacity-30 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Hero Content (55%) */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="lg:w-[55%] text-center lg:text-left"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                                <Sparkles size={14} />
                                <span>Interactive Automata Learning Platform</span>
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-display sm:text-[64px] font-bold font-heading text-text-primary dark:text-white tracking-tight leading-tight mb-6">
                                Master <span className="text-gradient">Automata Theory</span><br />
                                with Visual Simulations.
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-body-lg text-text-secondary dark:text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0">
                                Ditch the whiteboard. Build, simulate, and understand complex deterministic and non-deterministic structures in real-time right in your browser.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                                <Link to="/dfa">
                                    <Button size="lg" endIcon={<ArrowRight size={18} />} className="w-full sm:w-auto shadow-soft-md">
                                        Explore Modules
                                    </Button>
                                </Link>
                                <Link to="/documentation">
                                    <Button variant="outline" size="lg" startIcon={<Book size={18} />} className="w-full sm:w-auto">
                                        Read Documentation
                                    </Button>
                                </Link>
                            </motion.div>

                            <motion.div variants={itemVariants} className="mt-12 flex gap-8 justify-center lg:justify-start">
                                <div>
                                    <div className="font-bold text-text-primary dark:text-white">4 Core</div>
                                    <div className="text-xs text-text-secondary dark:text-slate-300">Learning Modules</div>
                                </div>
                                <div className="w-px bg-border"></div>
                                <div>
                                    <div className="font-bold text-text-primary dark:text-white">100%</div>
                                    <div className="text-xs text-text-secondary dark:text-slate-300">Interactive</div>
                                </div>
                                <div className="w-px bg-border"></div>
                                <div>
                                    <div className="font-bold text-text-primary dark:text-white">0ms</div>
                                    <div className="text-xs text-text-secondary dark:text-slate-300">Latency</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Hero Visuals (45%) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="lg:w-[45%] relative hidden lg:block"
                        >
                            {/* Dummy Graphic replacing real React Flow instance for now to ensure fast render */}
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl animate-pulse" />
                                <Card className="absolute inset-4 glass dark:glass-dark border border-white/20 dark:border-white/10 shadow-soft-lg flex items-center justify-center overflow-hidden">
                                    <div className="relative w-full h-full p-8 flex items-center justify-center">
                                        <svg width="100%" height="100%" viewBox="0 0 400 400" className="opacity-80">
                                            {/* Nodes */}
                                            <circle cx="100" cy="200" r="30" fill="currentColor" className="text-white dark:text-slate-800 stroke-primary stroke-2" />
                                            <text x="100" y="205" textAnchor="middle" className="text-sm font-bold fill-primary">q0</text>

                                            <circle cx="300" cy="200" r="30" fill="currentColor" className="text-white dark:text-slate-800 stroke-success stroke-[4]" />
                                            <circle cx="300" cy="200" r="24" fill="none" className="stroke-success stroke-2" />
                                            <text x="300" y="205" textAnchor="middle" className="text-sm font-bold fill-success">q1</text>

                                            {/* Edges */}
                                            <path d="M 130 200 Q 200 150 270 200" fill="none" className="stroke-primary stroke-2" markerEnd="url(#arrow)" />
                                            <text x="200" y="165" textAnchor="middle" className="text-sm font-medium fill-text-primary">a, b</text>

                                            <path d="M 100 230 Q 100 280 140 280 Q 180 280 180 230" fill="none" className="stroke-text-secondary stroke-2" markerEnd="url(#arrow)" />

                                            <defs>
                                                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-primary" />
                                                </marker>
                                            </defs>
                                        </svg>
                                    </div>
                                </Card>

                                {/* Floating Badges */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-6 -right-6 glass dark:glass-dark px-4 py-2 rounded-xl text-sm font-semibold text-text-primary dark:text-white shadow-soft-sm flex items-center gap-2"
                                >
                                    <CheckCircle2 size={16} className="text-success" /> String Accepted
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-10 -left-10 glass dark:glass-dark px-4 py-2 rounded-xl text-sm font-semibold text-text-primary dark:text-white shadow-soft-sm flex items-center gap-2"
                                >
                                    <Play size={16} className="text-primary" /> Live Simulation
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trusted Tech */}
            <section className="py-10 border-y border-border bg-white dark:bg-card-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-text-secondary dark:text-slate-300 font-medium uppercase tracking-widest mb-6">Powered by Modern Technologies</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">React</span>
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">Vite</span>
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">Flask</span>
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">Python</span>
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">Tailwind CSS</span>
                        <span className="font-bold text-xl text-text-primary dark:text-white cursor-pointer hover:scale-105 transition-transform">React Flow</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-h2 font-bold font-heading text-text-primary dark:text-white mb-4">
                            Interactive Learning Modules
                        </h2>
                        <p className="text-body text-text-secondary dark:text-slate-300">
                            Explore the core concepts of theoretical computer science through our meticulously designed, interactive modules. No installation required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={Network}
                            title="DFA Simulator"
                            description="Build Deterministic Finite Automata visually with a drag-and-drop node editor."
                            to="/dfa"
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Code}
                            title="Regex Tester"
                            description="Test Regular Expressions with real-time matching and syntax highlighting."
                            to="/regex"
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Layers}
                            title="PDA Builder"
                            description="Design Pushdown Automata to parse context-free languages with interactive stack visualization."
                            to="/pda"
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={Cpu}
                            title="CNF Converter"
                            description="Step-by-step conversion of Context-Free Grammars to Chomsky Normal Form."
                            to="/cnf"
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-24 bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-hover">
                        <StatisticItem value="15k+" label="Simulations Run" />
                        <StatisticItem value="4" label="Core Modules" />
                        <StatisticItem value="100%" label="Client-side Execution" />
                        <StatisticItem value="5.0" label="Star Rating" />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-h2 font-bold text-text-primary dark:text-white mb-4">Loved by Students</h2>
                        <p className="text-text-secondary dark:text-slate-300">Don't just take our word for it.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TestimonialCard
                            name="Sarah Jenkins" role="CS Student" university="MIT"
                            comment="AutomataLab made understanding PDA stacks incredibly visual and intuitive. I aced my midterms because of this!"
                            avatar="S"
                        />
                        <TestimonialCard
                            name="David Chen" role="Teaching Assistant" university="Stanford"
                            comment="I use AutomataLab to generate examples for my class. The export to JSON and PNG features are a lifesaver."
                            avatar="D"
                        />
                        <TestimonialCard
                            name="Elena Rodriguez" role="Self-taught Dev" university="Bootcamp"
                            comment="Regex used to look like magic to me. The conversion pipeline visualization finally helped it click."
                            avatar="E"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-h2 font-bold text-text-primary dark:text-white">Frequently Asked Questions</h2>
                    </div>
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-border px-6">
                            {faqs.map((faq, i) => (
                                <AccordionItem
                                    key={i}
                                    question={faq.q}
                                    answer={faq.a}
                                    isOpen={openFaqIndex === i}
                                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? -1 : i)}
                                />
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden flex-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-h2 font-bold text-text-primary dark:text-white mb-6">Ready to Master Automata Theory?</h2>
                    <p className="text-body-lg text-text-secondary dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of students and educators utilizing our premium platform to visualize the mathematical foundations of computer science.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dfa">
                            <Button size="lg" className="w-full sm:w-auto">Get Started for Free</Button>
                        </Link>
                        <a href="https://github.com" target="_blank" rel="noreferrer">
                            <Button variant="outline" size="lg" startIcon={<Github size={18} />} className="w-full sm:w-auto bg-surface">View on GitHub</Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
