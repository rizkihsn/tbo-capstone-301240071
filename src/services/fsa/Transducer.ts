export type State = string;
export type Symbol = string;
export type OutputSymbol = string;

export interface MealyTransition {
  from: State;
  to: State;
  symbol: Symbol;
  output: OutputSymbol;
}

export class MealyMachine {
  states: Set<State>;
  inputAlphabet: Set<Symbol>;
  outputAlphabet: Set<OutputSymbol>;
  transitions: MealyTransition[];
  startState: State;

  constructor(
    states: State[],
    inputAlphabet: Symbol[],
    outputAlphabet: OutputSymbol[],
    transitions: MealyTransition[],
    startState: State
  ) {
    this.states = new Set(states);
    this.inputAlphabet = new Set(inputAlphabet);
    this.outputAlphabet = new Set(outputAlphabet);
    this.transitions = transitions;
    this.startState = startState;
  }

  getTransition(state: State, symbol: Symbol): MealyTransition | null {
    return this.transitions.find(t => t.from === state && t.symbol === symbol) || null;
  }

  evaluate(inputString: string): { outputString: string, path: State[] } {
    let currentState = this.startState;
    const path: State[] = [currentState];
    let outputString = "";

    for (const symbol of inputString) {
      const transition = this.getTransition(currentState, symbol);
      if (!transition) {
        break; // Berhenti jika tidak ada transisi yang valid
      }
      outputString += transition.output;
      currentState = transition.to;
      path.push(currentState);
    }

    return { outputString, path };
  }
}

export interface MooreTransition {
  from: State;
  to: State;
  symbol: Symbol;
}

export class MooreMachine {
  states: Set<State>;
  inputAlphabet: Set<Symbol>;
  outputAlphabet: Set<OutputSymbol>;
  transitions: MooreTransition[];
  startState: State;
  stateOutputs: Record<State, OutputSymbol>; // Pemetaan State -> Output

  constructor(
    states: State[],
    inputAlphabet: Symbol[],
    outputAlphabet: OutputSymbol[],
    transitions: MooreTransition[],
    startState: State,
    stateOutputs: Record<State, OutputSymbol>
  ) {
    this.states = new Set(states);
    this.inputAlphabet = new Set(inputAlphabet);
    this.outputAlphabet = new Set(outputAlphabet);
    this.transitions = transitions;
    this.startState = startState;
    this.stateOutputs = stateOutputs;
  }

  getTransition(state: State, symbol: Symbol): State | null {
    const transition = this.transitions.find(t => t.from === state && t.symbol === symbol);
    return transition ? transition.to : null;
  }

  evaluate(inputString: string): { outputString: string, path: State[] } {
    let currentState = this.startState;
    const path: State[] = [currentState];
    // Moore machine selalu menghasilkan output awal untuk state awalnya
    let outputString = this.stateOutputs[currentState];

    for (const symbol of inputString) {
      const nextState = this.getTransition(currentState, symbol);
      if (!nextState) {
        break;
      }
      currentState = nextState;
      path.push(currentState);
      outputString += this.stateOutputs[currentState];
    }

    return { outputString, path };
  }
}
