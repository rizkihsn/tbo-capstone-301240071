/**
 * DFA/NFA Simulation Engine
 * Handles the mathematical execution of Deterministic and Non-Deterministic Finite Automata.
 */

export class AutomataEngine {
    constructor(states, alphabet, transitions, initialState, finalStates) {
        this.states = new Set(states);
        this.alphabet = new Set(alphabet);
        this.transitions = transitions; // Format: { 'q0': { 'a': ['q1'], 'b': ['q0'] } }
        this.initialState = initialState;
        this.finalStates = new Set(finalStates);
    }

    /**
     * Helper to get epsilon closure of a set of states (for NFA)
     */
    getEpsilonClosure(states) {
        const closure = new Set(states);
        const stack = [...states];

        while (stack.length > 0) {
            const current = stack.pop();
            const epsTransitions = this.transitions[current]?.[''] || [];
            
            for (const nextState of epsTransitions) {
                if (!closure.has(nextState)) {
                    closure.add(nextState);
                    stack.push(nextState);
                }
            }
        }
        return closure;
    }

    /**
     * Validates if the automata definition is structurally correct.
     */
    validateDefinition() {
        const errors = [];
        if (this.states.size === 0) errors.push("No states defined.");
        if (this.alphabet.size === 0) errors.push("Alphabet is empty.");
        if (!this.states.has(this.initialState)) errors.push("Initial state is not in the states set.");
        if (this.finalStates.size === 0) errors.push("No final states defined.");
        
        for (const state in this.transitions) {
            if (!this.states.has(state)) {
                errors.push(`Transition source state '${state}' is unknown.`);
            }
            for (const symbol in this.transitions[state]) {
                if (symbol !== '' && !this.alphabet.has(symbol)) {
                    errors.push(`Transition symbol '${symbol}' is not in the alphabet.`);
                }
                for (const target of this.transitions[state][symbol]) {
                    if (!this.states.has(target)) {
                        errors.push(`Transition target state '${target}' is unknown.`);
                    }
                }
            }
        }
        
        return { isValid: errors.length === 0, errors };
    }

    /**
     * Simulates the automata against an input string.
     * Supports NFA execution by maintaining a set of current active states.
     * 
     * @param {string} input - The string to test.
     * @returns {Object} Result containing timeline and acceptance status.
     */
    simulate(input) {
        const timeline = [];
        let currentStates = this.getEpsilonClosure(new Set([this.initialState]));
        
        // Initial state log
        timeline.push({
            step: 0,
            symbol: null,
            activeStates: Array.from(currentStates),
            remainingInput: input
        });

        let stepCount = 1;
        for (let i = 0; i < input.length; i++) {
            const symbol = input[i];
            
            // If symbol is not in alphabet, it automatically rejects
            if (!this.alphabet.has(symbol)) {
                return {
                    accepted: false,
                    reason: `Invalid symbol '${symbol}' encountered.`,
                    timeline
                };
            }

            const nextStates = new Set();
            for (const state of currentStates) {
                const targets = this.transitions[state]?.[symbol] || [];
                for (const target of targets) {
                    nextStates.add(target);
                }
            }

            currentStates = this.getEpsilonClosure(nextStates);

            timeline.push({
                step: stepCount++,
                symbol: symbol,
                activeStates: Array.from(currentStates),
                remainingInput: input.substring(i + 1)
            });

            // If we reach an empty set of states, simulation dies (rejected)
            if (currentStates.size === 0) {
                return {
                    accepted: false,
                    reason: `No valid transition found for symbol '${symbol}'. Machine halted.`,
                    timeline
                };
            }
        }

        // Check if any of the active states at the end is a final state
        let isAccepted = false;
        for (const state of currentStates) {
            if (this.finalStates.has(state)) {
                isAccepted = true;
                break;
            }
        }

        return {
            accepted: isAccepted,
            reason: isAccepted ? "Ended on a final state." : "Did not end on a final state.",
            timeline
        };
    }
}
