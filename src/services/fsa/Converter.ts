import { NFA, State as NfaState, Symbol, Transition as NfaTransition } from './NFA';
import { DFA, State as DfaState, Transition as DfaTransition } from './DFA';

export class FSAConverter {
  /**
   * Mengonversi NFA menjadi DFA menggunakan Algoritma Subset Construction.
   */
  static nfaToDfa(nfa: NFA): DFA {
    const dfaStates: DfaState[] = [];
    const dfaTransitions: DfaTransition[] = [];
    const dfaFinalStates: DfaState[] = [];
    
    // Antrean untuk memproses subset baru yang ditemukan
    const queue: Set<NfaState>[] = [];
    // Menyimpan string representasi dari subset untuk mengecek duplikasi (misal: "q0,q1")
    const processedSubsets = new Set<string>();

    // 1. Dapatkan Start State DFA (yaitu Epsilon Closure dari Start State NFA)
    const initialSubset = new Set(nfa.getEpsilonClosure([nfa.startState]));
    const initialSubsetString = this.subsetToString(initialSubset);
    
    queue.push(initialSubset);
    processedSubsets.add(initialSubsetString);
    dfaStates.push(initialSubsetString);

    // Tandai sebagai final state jika mengandung final state NFA
    if (this.containsFinalState(initialSubset, nfa.finalStates)) {
      dfaFinalStates.push(initialSubsetString);
    }

    // 2. Proses antrean (BFS)
    while (queue.length > 0) {
      const currentSubset = queue.shift()!;
      const currentSubsetString = this.subsetToString(currentSubset);

      // Untuk setiap simbol pada alfabet (kecuali epsilon)
      for (const symbol of Array.from(nfa.alphabet)) {
        const nextSubset = new Set<NfaState>();

        // Kumpulkan semua transisi untuk simbol ini dari setiap state dalam subset
        for (const state of Array.from(currentSubset)) {
          const transitions = nfa.getTransitions(state, symbol);
          for (const nextState of transitions) {
            nextSubset.add(nextState);
          }
        }

        // Terapkan Epsilon Closure pada hasil transisi
        const epsilonClosedNextSubset = new Set(
          nfa.getEpsilonClosure(Array.from(nextSubset))
        );

        if (epsilonClosedNextSubset.size === 0) continue; // Jangan buat transisi ke state mati (kecuali jika dibutuhkan)

        const nextSubsetString = this.subsetToString(epsilonClosedNextSubset);

        // Rekam transisi DFA
        dfaTransitions.push({
          from: currentSubsetString,
          to: nextSubsetString,
          symbol: symbol,
        });

        // Jika subset ini belum pernah diproses, masukkan ke antrean
        if (!processedSubsets.has(nextSubsetString)) {
          processedSubsets.add(nextSubsetString);
          queue.push(epsilonClosedNextSubset);
          dfaStates.push(nextSubsetString);

          // Cek final state
          if (this.containsFinalState(epsilonClosedNextSubset, nfa.finalStates)) {
            dfaFinalStates.push(nextSubsetString);
          }
        }
      }
    }

    return new DFA(
      dfaStates,
      Array.from(nfa.alphabet),
      dfaTransitions,
      initialSubsetString,
      dfaFinalStates
    );
  }

  // Utility: Konversi Set ke String berurutan untuk penamaan state DFA (contoh: "{q0, q1}")
  private static subsetToString(subset: Set<NfaState>): string {
    if (subset.size === 0) return "∅";
    return `{${Array.from(subset).sort().join(',')}}`;
  }

  // Utility: Cek apakah subset mengandung final state NFA
  private static containsFinalState(subset: Set<NfaState>, finalStates: Set<NfaState>): boolean {
    for (const state of Array.from(subset)) {
      if (finalStates.has(state)) return true;
    }
    return false;
  }
}
