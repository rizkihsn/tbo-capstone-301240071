# AutomataLab

AutomataLab is an interactive, fully client-side web application designed to help students and developers visualize and simulate Theoretical Computer Science concepts. It brings abstract mathematical models to life through interactive graphs and step-by-step algorithms running directly in the browser.

## Features

- **DFA & NFA Simulator**: Build Deterministic and Non-Deterministic Finite Automata visually. Test strings and watch the execution trace step-by-step.
- **Regex Studio**: Test Regular Expressions and see the automated conversion pipeline from Regex → Thompson NFA → DFA → Minimized DFA.
- **Pushdown Automata (PDA) Builder**: Simulate PDAs with a real-time stack visualizer. Supports acceptance by empty stack and final state.
- **CFG to CNF Converter**: A step-by-step educational tool that transforms any Context-Free Grammar into Chomsky Normal Form through the standard 5-step process.

## Technology Stack

AutomataLab is a modern Single Page Application (SPA) built for performance and maintainability:

- **Frontend Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Visualization**: React Flow (for node-based graphs)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Simulation Engines**: Custom pure JavaScript algorithms (`src/services/simulation/`)

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/rizkihsn/tbo-capstone-301240071.git
cd AutomataLab/frontend
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure
All core logic is implemented entirely in the frontend for zero-latency interactions.
- `src/components/`: Reusable UI components (buttons, cards, forms)
- `src/pages/`: Main application views (DFA, Regex, PDA, CNF, Docs, About)
- `src/services/simulation/`: Core automata algorithms (engines for DFA, Regex, PDA, CFG)
- `src/styles/`: Global Tailwind configuration

## License
MIT License
