export type Variable = string;
export type Terminal = string;

// Produksi: Kiri (Satu Variabel) -> Kanan (Array Variabel/Terminal)
export interface ProductionRule {
  left: Variable;
  right: string[]; // Bisa kosong (epsilon) direpresentasikan dengan EPSILON
}

export const EPSILON = "ε";

export class CFG {
  variables: Set<Variable>;
  terminals: Set<Terminal>;
  rules: ProductionRule[];
  startVariable: Variable;

  constructor(
    variables: Variable[],
    terminals: Terminal[],
    rules: ProductionRule[],
    startVariable: Variable
  ) {
    this.variables = new Set(variables);
    this.terminals = new Set(terminals);
    this.rules = rules;
    this.startVariable = startVariable;
    
    this.validate();
  }

  private validate() {
    if (!this.variables.has(this.startVariable)) {
      throw new Error(`Start variable '${this.startVariable}' tidak ada di daftar variabel (V).`);
    }

    // Variabel dan terminal tidak boleh beririsan
    for (const v of this.variables) {
      if (this.terminals.has(v)) {
        throw new Error(`Simbol '${v}' tidak boleh berada di himpunan variabel (V) dan terminal (Σ) sekaligus.`);
      }
    }

    // Validasi aturan produksi
    for (const rule of this.rules) {
      if (!this.variables.has(rule.left)) {
        throw new Error(`Aturan produksi tidak valid: Sisi kiri '${rule.left}' bukan merupakan variabel.`);
      }

      for (const symbol of rule.right) {
        if (!this.variables.has(symbol) && !this.terminals.has(symbol) && symbol !== EPSILON) {
          throw new Error(`Aturan produksi tidak valid: Simbol '${symbol}' di sisi kanan tidak dikenali (bukan variabel maupun terminal).`);
        }
      }
    }
  }

  // Helper untuk format cetak
  public toString(): string {
    const grouped = new Map<Variable, string[][]>();
    for (const rule of this.rules) {
      if (!grouped.has(rule.left)) {
        grouped.set(rule.left, []);
      }
      grouped.get(rule.left)!.push(rule.right.length === 0 ? [EPSILON] : rule.right);
    }

    let output = "";
    grouped.forEach((rights, left) => {
      const rightStr = rights.map(r => r.join('')).join(' | ');
      output += `${left} → ${rightStr}\n`;
    });
    return output;
  }
}

// Struktur Data untuk Parse Tree
export interface ParseTreeNode {
  name: string; // Bisa berupa Variabel (S) atau Terminal (a)
  children?: ParseTreeNode[];
}

// Helper untuk membangun pohon penurunan secara statis (sebagai contoh)
export const generateExampleParseTree = (): ParseTreeNode => {
  // Contoh untuk tata bahasa:
  // S -> aSb | ε
  // Menghasilkan string: aabb
  return {
    name: "S",
    children: [
      { name: "a" },
      {
        name: "S",
        children: [
          { name: "a" },
          {
            name: "S",
            children: [
              { name: EPSILON }
            ]
          },
          { name: "b" }
        ]
      },
      { name: "b" }
    ]
  };
};
