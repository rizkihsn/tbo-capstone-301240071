export type State = string;
export type Symbol = string;
export type StackSymbol = string;

export const EPSILON = "ε";

export interface PDATransition {
  from: State;
  to: State;
  input: Symbol; // bisa huruf biasa atau EPSILON
  pop: StackSymbol; // elemen teratas stack yang harus ada dan akan di-pop
  push: StackSymbol[]; // elemen-elemen yang akan di-push ke stack (urutan: indeks 0 akan ada di paling atas)
}

export interface PDAHistoryNode {
  state: State;
  stack: StackSymbol[];
  inputConsumed: number;
  action: string;
}
export class DPDA {
  states: Set<State>;
  inputAlphabet: Set<Symbol>;
  stackAlphabet: Set<StackSymbol>;
  transitions: PDATransition[];
  startState: State;
  initialStackSymbol: StackSymbol;
  finalStates: Set<State>;

  constructor(
    states: State[],
    inputAlphabet: Symbol[],
    stackAlphabet: StackSymbol[],
    transitions: PDATransition[],
    startState: State,
    initialStackSymbol: StackSymbol,
    finalStates: State[]
  ) {
    this.states = new Set(states);
    this.inputAlphabet = new Set(inputAlphabet);
    this.stackAlphabet = new Set(stackAlphabet);
    this.transitions = transitions;
    this.startState = startState;
    this.initialStackSymbol = initialStackSymbol;
    this.finalStates = new Set(finalStates);
  }

  // Mendapatkan transisi untuk PDA Deterministik (Hanya mengembalikan 1 jika ada)
  getTransition(state: State, input: Symbol, topOfStack: StackSymbol | undefined): PDATransition | null {
    if (!topOfStack) return null;
    
    // Prioritaskan transisi spesifik input
    const specificTrans = this.transitions.find(
      (t) => t.from === state && t.input === input && t.pop === topOfStack
    );
    if (specificTrans) return specificTrans;

    // Jika tidak ada, cek apakah ada transisi Epsilon (bergerak tanpa konsumsi input, tapi mengubah stack)
    const epsilonTrans = this.transitions.find(
      (t) => t.from === state && t.input === EPSILON && t.pop === topOfStack
    );
    
    return epsilonTrans || null;
  }

  evaluate(inputString: string): { accepted: boolean; history: PDAHistoryNode[] } {
    let currentState = this.startState;
    let currentStack: StackSymbol[] = [this.initialStackSymbol];
    
    // Sejarah (history) langkah demi langkah untuk divisualisasikan di UI
    const history = [{
      state: currentState,
      stack: [...currentStack],
      inputConsumed: 0,
      action: "Inisialisasi"
    }];

    let inputIndex = 0;
    
    // Mencegah infinite loop epsilon
    let epsilonCount = 0;
    const MAX_EPSILON = 100;

    while (inputIndex <= inputString.length) {
      // Selesai jika string habis, KECUALI masih ada transisi epsilon yang bisa dilakukan untuk mengosongkan stack
      const currentInput = inputIndex < inputString.length ? inputString[inputIndex] : EPSILON;
      const topOfStack = currentStack[currentStack.length - 1]; // Paling ujung array adalah Top of Stack

      const transition = this.getTransition(currentState, currentInput, topOfStack);

      if (!transition) {
        // Jika tidak ada transisi epsilon lanjutan saat string sudah habis, berhenti.
        if (currentInput === EPSILON) break;
        
        // Crash / Reject (Simbol tak dikenal atau kombinasi stack salah)
        history.push({
          state: currentState,
          stack: [...currentStack],
          inputConsumed: inputIndex,
          action: "Crash! Tidak ada transisi yang valid."
        });
        return { accepted: false, history };
      }

      // Lakukan transisi
      if (transition.input !== EPSILON) {
        inputIndex++; // Konsumsi 1 karakter
        epsilonCount = 0; // Reset
      } else {
        epsilonCount++;
        if (epsilonCount > MAX_EPSILON) {
          throw new Error("Terjebak dalam Epsilon Loop tak terhingga.");
        }
      }

      // Pop the top of stack
      currentStack.pop();

      // Push elemen-elemen baru (jika tidak epsilon / string kosong di definisinya)
      // Ingat: dalam spesifikasi kita, t.push adalah array of StackSymbol.
      // Misal t.push = ['A', 'Z']. Agar 'A' jadi top of stack, kita push 'Z' lalu 'A' (reverse).
      if (transition.push.length > 0 && transition.push[0] !== EPSILON) {
        for (let i = transition.push.length - 1; i >= 0; i--) {
          currentStack.push(transition.push[i]);
        }
      }

      currentState = transition.to;

      history.push({
        state: currentState,
        stack: [...currentStack],
        inputConsumed: inputIndex,
        action: `Membaca '${transition.input}', Pop '${transition.pop}', Push '[${transition.push.join(',')}]'`
      });
    }

    // PDA Diterima berdasarkan kriteria Final State (bisa juga berdasar Empty Stack, tapi kita pilih Final State)
    const accepted = this.finalStates.has(currentState);
    
    return { accepted, history };
  }
}
