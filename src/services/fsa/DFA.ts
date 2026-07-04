export type State = string;
export type Symbol = string;

export interface Transition {
  from: State;
  to: State;
  symbol: Symbol;
}

export interface FSAHistoryNode {
  state: State;
  inputConsumed: number;
  symbol: Symbol | string;
  action: string;
}

export class DFA {
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
      if (!this.alphabet.has(t.symbol)) throw new Error(`Transition uses unknown symbol '${t.symbol}'.`);
    }
  }

  // Fungsi Transisi (δ: Q x Σ -> Q)
  getTransition(state: State, symbol: Symbol): State | null {
    const transition = this.transitions.find(
      (t) => t.from === state && t.symbol === symbol
    );
    return transition ? transition.to : null;
  }

  // Evaluasi string
  evaluate(inputString: string): { accepted: boolean; path: State[]; history: FSAHistoryNode[] } {
    let currentState = this.startState;
    const path: State[] = [currentState];
    const history: FSAHistoryNode[] = [{
      state: currentState,
      inputConsumed: 0,
      symbol: "",
      action: "Inisialisasi"
    }];

    let inputConsumed = 0;
    for (const symbol of inputString) {
      if (!this.alphabet.has(symbol)) {
        history.push({
          state: currentState,
          inputConsumed,
          symbol,
          action: `Crash! Simbol '${symbol}' tidak dikenal.`
        });
        return { accepted: false, path, history }; // Simbol tidak dikenal
      }

      const nextState = this.getTransition(currentState, symbol);
      if (!nextState) {
        history.push({
          state: currentState,
          inputConsumed,
          symbol,
          action: `Crash! Tidak ada transisi dari state '${currentState}' dengan simbol '${symbol}'.`
        });
        return { accepted: false, path, history }; // Tidak ada transisi (dead state)
      }

      inputConsumed++;
      currentState = nextState;
      path.push(currentState);
      history.push({
        state: currentState,
        inputConsumed,
        symbol,
        action: `Membaca '${symbol}', transisi ke '${currentState}'.`
      });
    }

    const accepted = this.finalStates.has(currentState);
    return { accepted, path, history };
  }
}
