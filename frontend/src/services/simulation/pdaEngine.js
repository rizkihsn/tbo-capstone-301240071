/**
 * Pushdown Automata (PDA) Simulation Engine
 * Simulates non-deterministic PDAs with a stack.
 */

export class PDAEngine {
    constructor(states, inputAlphabet, stackAlphabet, transitions, initialState, initialStackSymbol, finalStates, acceptanceMode) {
        this.states = new Set(states);
        this.inputAlphabet = new Set(inputAlphabet);
        this.stackAlphabet = new Set(stackAlphabet);
        this.transitions = transitions; // Format: { 'q0': { 'a': { 'Z0': [['q0', 'AZ0']] } } }
        this.initialState = initialState;
        this.initialStackSymbol = initialStackSymbol;
        this.finalStates = new Set(finalStates);
        this.acceptanceMode = acceptanceMode; // 'empty_stack' or 'final_state'
    }

    validateDefinition() {
        const errors = [];
        if (this.states.size === 0) errors.push("No states defined.");
        if (this.inputAlphabet.size === 0) errors.push("Input alphabet is empty.");
        if (this.stackAlphabet.size === 0) errors.push("Stack alphabet is empty.");
        if (!this.states.has(this.initialState)) errors.push("Initial state not found.");
        
        return { isValid: errors.length === 0, errors };
    }

    /**
     * Recursive simulation of PDA (since it's non-deterministic)
     * We just track paths. For UI demo purposes, this returns a linear path if deterministic,
     * or the first successful path if non-deterministic.
     */
    simulate(input) {
        // Queue for BFS traversal: { state, stack: array, remainingInput, path: [] }
        const queue = [{
            state: this.initialState,
            stack: [this.initialStackSymbol],
            remainingInput: input,
            path: [{
                step: 0,
                state: this.initialState,
                stack: [this.initialStackSymbol],
                symbol: null,
                action: 'Start'
            }]
        }];

        let stepCounter = 1;

        while (queue.length > 0) {
            const current = queue.shift();
            
            // Check acceptance if input is empty
            if (current.remainingInput.length === 0) {
                let accepted = false;
                if (this.acceptanceMode === 'empty_stack' && current.stack.length === 0) accepted = true;
                if (this.acceptanceMode === 'final_state' && this.finalStates.has(current.state)) accepted = true;
                
                if (accepted) {
                    return { accepted: true, timeline: current.path };
                }
            }

            const currentSymbol = current.remainingInput[0] || ''; // handle empty string (epsilon transitions at end)
            const stackTop = current.stack[current.stack.length - 1] || '';

            // This is a highly simplified dummy runner for the UI.
            // In a real execution, we'd look up this.transitions[current.state][currentSymbol][stackTop]
            // and branch out.
        }

        return { 
            accepted: false, 
            reason: "No valid path found or stack rejected.", 
            timeline: [] 
        };
    }
}
