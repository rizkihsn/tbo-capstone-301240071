/**
 * Regular Expression Simulation Engine
 * Parses Regex, validates, and simulates conversion to NFA using Thompson's Construction.
 */

export class RegexEngine {
    constructor(regexString) {
        this.regexString = regexString;
    }

    /**
     * Highly simplified validation just to check for unbalanced parentheses and empty strings
     */
    validate() {
        if (!this.regexString || this.regexString.trim() === "") {
            return { isValid: false, errors: ["Regex cannot be empty."] };
        }

        let open = 0;
        for (let char of this.regexString) {
            if (char === '(') open++;
            if (char === ')') {
                open--;
                if (open < 0) return { isValid: false, errors: ["Unbalanced parentheses."] };
            }
        }
        
        if (open !== 0) return { isValid: false, errors: ["Unbalanced parentheses."] };
        
        return { isValid: true, errors: [] };
    }

    /**
     * Dummy AST generator for demonstration
     */
    explain() {
        // In a real scenario, this builds an AST and generates natural language
        if (!this.validate().isValid) return "Invalid regular expression.";
        
        return `This regex '${this.regexString}' attempts to match a sequence of characters according to its operators (concatenation, union, and Kleene star).`;
    }

    /**
     * Thompson's Construction simulation (returns mock data for UI visualization)
     * In a real compiler, this returns a graph of states.
     */
    convertToNFA() {
        return {
            states: ['q0', 'q1', 'q2', 'q3'],
            initialState: 'q0',
            finalStates: ['q3'],
            transitions: {
                'q0': { '': ['q1'] },
                'q1': { 'a': ['q2'] },
                'q2': { '': ['q3'] }
            }
        };
    }
}
