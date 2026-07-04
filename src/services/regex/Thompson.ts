import { ASTNode, LiteralNode, ConcatNode, UnionNode, StarNode } from './RegexParser';
import { NFA, EPSILON, Transition as NfaTransition } from '../fsa/NFA';

// Struktur sementara (Fragment) selama konstruksi NFA
interface NFAFragment {
  startState: string;
  finalState: string; // Dalam Thompson construction murni, selalu ada tepat 1 final state per sub-NFA
  states: Set<string>;
  transitions: NfaTransition[];
}

export class ThompsonConstruction {
  private static stateCounter = 0;

  // Generator nama state unik
  private static newState(): string {
    return `q${this.stateCounter++}`;
  }

  // Mengubah AST menjadi mesin NFA utuh
  public static astToNFA(astRoot: ASTNode): NFA {
    this.stateCounter = 0; // Reset counter
    const fragment = this.traverse(astRoot);

    // Kumpulkan alfabet dari transisi yang terbentuk (kecuali Epsilon)
    const alphabet = new Set<string>();
    fragment.transitions.forEach((t) => {
      if (t.symbol !== EPSILON) {
        alphabet.add(t.symbol);
      }
    });

    return new NFA(
      Array.from(fragment.states),
      Array.from(alphabet),
      fragment.transitions,
      fragment.startState,
      [fragment.finalState]
    );
  }

  // Rekursif penjelajahan pohon AST
  private static traverse(node: ASTNode): NFAFragment {
    if (node instanceof LiteralNode) {
      return this.buildLiteral(node.value);
    } else if (node instanceof ConcatNode) {
      const leftFrag = this.traverse(node.left);
      const rightFrag = this.traverse(node.right);
      return this.buildConcat(leftFrag, rightFrag);
    } else if (node instanceof UnionNode) {
      const leftFrag = this.traverse(node.left);
      const rightFrag = this.traverse(node.right);
      return this.buildUnion(leftFrag, rightFrag);
    } else if (node instanceof StarNode) {
      const childFrag = this.traverse(node.child);
      return this.buildStar(childFrag);
    }
    
    throw new Error("Tipe AST Node tidak dikenali oleh Thompson's Construction.");
  }

  private static buildLiteral(char: string): NFAFragment {
    const startState = this.newState();
    const finalState = this.newState();
    
    return {
      startState,
      finalState,
      states: new Set([startState, finalState]),
      transitions: [
        { from: startState, to: finalState, symbol: char }
      ]
    };
  }

  private static buildConcat(left: NFAFragment, right: NFAFragment): NFAFragment {
    // Gabungkan state dan transisi
    const states = new Set([...Array.from(left.states), ...Array.from(right.states)]);
    const transitions = [...left.transitions, ...right.transitions];

    // Jembatani Final kiri dengan Start kanan menggunakan Epsilon
    transitions.push({
      from: left.finalState,
      to: right.startState,
      symbol: EPSILON
    });

    return {
      startState: left.startState,
      finalState: right.finalState,
      states,
      transitions
    };
  }

  private static buildUnion(left: NFAFragment, right: NFAFragment): NFAFragment {
    const startState = this.newState();
    const finalState = this.newState();

    const states = new Set([
      startState, 
      finalState, 
      ...Array.from(left.states), 
      ...Array.from(right.states)
    ]);
    
    const transitions = [...left.transitions, ...right.transitions];

    // Cabang dari Start baru ke Start kiri dan kanan
    transitions.push({ from: startState, to: left.startState, symbol: EPSILON });
    transitions.push({ from: startState, to: right.startState, symbol: EPSILON });

    // Cabang dari Final kiri dan kanan ke Final baru
    transitions.push({ from: left.finalState, to: finalState, symbol: EPSILON });
    transitions.push({ from: right.finalState, to: finalState, symbol: EPSILON });

    return {
      startState,
      finalState,
      states,
      transitions
    };
  }

  private static buildStar(child: NFAFragment): NFAFragment {
    const startState = this.newState();
    const finalState = this.newState();

    const states = new Set([startState, finalState, ...Array.from(child.states)]);
    const transitions = [...child.transitions];

    // Pengulangan 0 kali (langsung lompat ke akhir)
    transitions.push({ from: startState, to: finalState, symbol: EPSILON });
    
    // Masuk ke mesin child
    transitions.push({ from: startState, to: child.startState, symbol: EPSILON });

    // Pengulangan (dari final child kembali ke start child)
    transitions.push({ from: child.finalState, to: child.startState, symbol: EPSILON });

    // Keluar dari mesin child
    transitions.push({ from: child.finalState, to: finalState, symbol: EPSILON });

    return {
      startState,
      finalState,
      states,
      transitions
    };
  }
}
