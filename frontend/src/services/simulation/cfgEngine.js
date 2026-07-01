/**
 * CFG to CNF Conversion Engine
 * Handles the mathematical steps to transform a Context Free Grammar to Chomsky Normal Form.
 */

export class CFGEngine {
    constructor(grammarString) {
        this.grammarString = grammarString;
        this.productions = this.parseGrammar(grammarString);
    }

    parseGrammar(str) {
        // Dummy parser
        return [
            { left: 'S', right: ['AB', 'a'] },
            { left: 'A', right: ['aA', 'ε'] },
            { left: 'B', right: ['bB', 'b'] }
        ];
    }

    /**
     * Pipeline Steps
     */
    removeEpsilon() {
        return {
            description: "Removed A -> ε",
            newProductions: [
                { left: 'S', right: ['AB', 'B', 'a'] },
                { left: 'A', right: ['aA', 'a'] },
                { left: 'B', right: ['bB', 'b'] }
            ]
        };
    }

    removeUnit() {
        // Step 2...
        return {
            description: "Removed S -> B",
            newProductions: []
        };
    }

    removeUseless() {
        // Step 3...
        return {};
    }

    replaceTerminals() {
        // Step 4...
        return {};
    }

    binaryConversion() {
        // Step 5...
        return {};
    }

    getFullPipeline() {
        return {
            original: this.productions,
            step1: this.removeEpsilon(),
            step2: this.removeUnit(),
            step3: this.removeUseless(),
            step4: this.replaceTerminals(),
            step5: this.binaryConversion()
        };
    }
}
