import apiClient from './apiClient';

/**
 * Service to handle all DFA related backend operations.
 * Currently mocked for frontend development readiness.
 */
export const dfaService = {
    /**
     * Simulate a string against a DFA model
     * @param {Object} dfaModel - The JSON structure of the DFA
     * @param {string} testString - The string to test
     * @returns {Promise<{accepted: boolean, path: Array}>}
     */
    simulateString: async (dfaModel, testString) => {
        // Mocking API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock result
                const accepted = Math.random() > 0.5;
                resolve({
                    accepted,
                    path: ['q0', 'q1'] // dummy path
                });
            }, 800);
        });
        
        // Future Real Implementation:
        // return await apiClient.post('/dfa/simulate', { dfaModel, testString });
    },

    saveModel: async (dfaModel, name) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: Date.now(), name, status: 'success' });
            }, 500);
        });
        // return await apiClient.post('/dfa/models', { name, model: dfaModel });
    }
};
