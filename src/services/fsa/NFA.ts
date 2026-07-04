export type State = string;
export type Symbol = string;

// Kita gunakan konstanta khusus untuk Epsilon (ε)
export const EPSILON = "ε";

export interface Transition {
  from: State;
  to: State;
  symbol: Symbol; // bisa berupa huruf biasa atau EPSILON
}

export interface NFAHistoryNode {
  activeStates: State[];
  inputConsumed: number;
  symbol: Symbol | string;
  action: string;
}

export class NFA {
  states: Set<State>;
  alphabet: Set<Symbol>;
  transitions: Transition[];
  startState: State;
  finalStates: Set<State>;

  constructor(
    states: State[],
    alphabet: Symbol[],
    transitions: Transition[],
    startState: State,
    finalStates: State[]
  ) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    this.transitions = transitions;
    this.startState = startState;
    this.finalStates = new Set(finalStates);

    this.validate();
  }

  private validate() {
    if (!this.states.has(this.startState)) {
      throw new Error(`Start state '${this.startState}' is not in the set of states.`);
    }
    for (const fs of this.finalStates) {
      if (!this.states.has(fs)) {
        throw new Error(`Final state '${fs}' is not in the set of states.`);
      }
    }
    for (const t of this.transitions) {
      if (!this.states.has(t.from)) throw new Error(`Transition from unknown state '${t.from}'.`);
      if (!this.states.has(t.to)) throw new Error(`Transition to unknown state '${t.to}'.`);
      if (!this.alphabet.has(t.symbol) && t.symbol !== EPSILON) {
        throw new Error(`Transition uses unknown symbol '${t.symbol}'.`);
      }
    }
  }

  // Mendapatkan daftar state tujuan dari satu state untuk simbol tertentu
  getTransitions(state: State, symbol: Symbol): State[] {
    return this.transitions
      .filter((t) => t.from === state && t.symbol === symbol)
      .map((t) => t.to);
  }

  // Epsilon Closure: Mencari semua state yang bisa dicapai tanpa membaca simbol input
  getEpsilonClosure(states: State[]): State[] {
    const closure = new Set<State>(states);
    const stack = [...states];

    while (stack.length > 0) {
      const currentState = stack.pop()!;
      const epsilonTransitions = this.getTransitions(currentState, EPSILON);

      for (const nextState of epsilonTransitions) {
        if (!closure.has(nextState)) {
          closure.add(nextState);
          stack.push(nextState);
        }
      }
    }
    
    return Array.from(closure);
  }

  // Evaluasi string
  evaluate(inputString: string): { accepted: boolean; pathHistory: State[][]; history: NFAHistoryNode[] } {
    let currentStates = this.getEpsilonClosure([this.startState]);
    const pathHistory: State[][] = [[...currentStates]];
    const history: NFAHistoryNode[] = [{
      activeStates: [...currentStates],
      inputConsumed: 0,
      symbol: "",
      action: "Inisialisasi & Epsilon Closure awal"
    }];

    let inputConsumed = 0;
    for (const symbol of inputString) {
      if (!this.alphabet.has(symbol) && symbol !== EPSILON) {
        history.push({
          activeStates: [...currentStates],
          inputConsumed,
          symbol,
          action: `Crash! Simbol '${symbol}' tidak dikenal.`
        });
        return { accepted: false, pathHistory, history }; // Simbol tak dikenal
      }

      const nextStates = new Set<State>();
      for (const state of currentStates) {
        const transitions = this.getTransitions(state, symbol);
        for (const next of transitions) {
          nextStates.add(next);
        }
      }

      currentStates = this.getEpsilonClosure(Array.from(nextStates));
      pathHistory.push([...currentStates]);
      inputConsumed++;

      if (currentStates.length === 0) {
        history.push({
          activeStates: [],
          inputConsumed,
          symbol,
          action: `Membaca '${symbol}', semua cabang (alam semesta) mati.`
        });
        return { accepted: false, pathHistory, history };
      }

      history.push({
        activeStates: [...currentStates],
        inputConsumed,
        symbol,
        action: `Membaca '${symbol}', transisi & epsilon closure ke [${currentStates.join(', ')}]`
      });
    }

    const accepted = currentStates.some((state) => this.finalStates.has(state));
    return { accepted, pathHistory, history };
  }
}
