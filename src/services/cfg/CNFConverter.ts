import { CFG, ProductionRule, Variable, Terminal, EPSILON } from './CFG';

/**
 * Konverter CFG ke Chomsky Normal Form (CNF).
 * 
 * Dalam CNF, setiap aturan produksi harus berbentuk salah satu dari:
 *   1. A → BC     (Dua variabel, tepat dua)
 *   2. A → a      (Satu terminal, tepat satu)
 *   3. S → ε      (Hanya diizinkan untuk Start Variable)
 * 
 * Langkah-langkah konversi:
 *   1. START: Buat start variable baru S0 → S
 *   2. TERM:  Ganti terminal di produksi panjang (>1) dengan variabel baru
 *   3. BIN:   Pecah produksi dengan >2 simbol menjadi biner
 *   4. DEL:   Hapus ε-productions (nullable variables)
 *   5. UNIT:  Hapus unit productions (A → B)
 */
export interface CNFConversionStep {
  stepName: string;
  description: string;
  rules: ProductionRule[];
  variables: Variable[];
}

export class CNFConverter {
  private steps: CNFConversionStep[] = [];
  private newVarCounter = 0;
  private terminalVarMap = new Map<Terminal, Variable>(); // Cache: terminal -> variabel pengganti

  private generateNewVar(): Variable {
    // Gunakan huruf kapital yang jarang dipakai, lalu tambahkan angka jika habis
    const base = "XYWUVTPQRMNLKJIHGFEDCBA";
    if (this.newVarCounter < base.length) {
      return base[this.newVarCounter++];
    }
    return `Z${this.newVarCounter++}`;
  }

  private getTerminalVar(terminal: Terminal, existingVars: Set<Variable>): Variable {
    if (this.terminalVarMap.has(terminal)) {
      return this.terminalVarMap.get(terminal)!;
    }
    let newVar = `T_${terminal}`;
    // Pastikan tidak bentrok dengan variabel yang sudah ada
    while (existingVars.has(newVar)) {
      newVar = `T_${terminal}${this.newVarCounter++}`;
    }
    this.terminalVarMap.set(terminal, newVar);
    return newVar;
  }

  public convert(cfg: CFG): { result: CFG; steps: CNFConversionStep[] } {
    this.steps = [];
    this.newVarCounter = 0;
    this.terminalVarMap.clear();

    let variables = Array.from(cfg.variables);
    let terminals = Array.from(cfg.terminals);
    let rules = cfg.rules.map(r => ({ ...r, right: [...r.right] })); // deep copy
    let startVariable = cfg.startVariable;

    // Simpan keadaan awal
    this.steps.push({
      stepName: "Original",
      description: "Tata bahasa asli sebelum konversi.",
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // ==================== LANGKAH 1: START ====================
    // Buat start variable baru agar start variable asli bebas muncul di sisi kanan
    const newStart = "S₀";
    variables = [newStart, ...variables];
    rules = [{ left: newStart, right: [startVariable] }, ...rules];
    startVariable = newStart;

    this.steps.push({
      stepName: "1. START",
      description: `Buat start variable baru ${newStart} → ${cfg.startVariable}. Ini mencegah start variable muncul di sisi kanan aturan.`,
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // ==================== LANGKAH 2: TERM ====================
    // Ganti terminal di aturan yang panjangnya > 1 dengan variabel baru
    const termRules: ProductionRule[] = [];
    const varSet = new Set(variables);

    for (const rule of rules) {
      if (rule.right.length > 1) {
        const newRight: string[] = [];
        for (const symbol of rule.right) {
          if (terminals.includes(symbol)) {
            const tVar = this.getTerminalVar(symbol, varSet);
            if (!varSet.has(tVar)) {
              varSet.add(tVar);
              variables.push(tVar);
              termRules.push({ left: tVar, right: [symbol] });
            }
            newRight.push(tVar);
          } else {
            newRight.push(symbol);
          }
        }
        rule.right = newRight;
      }
    }
    rules = [...rules, ...termRules];

    this.steps.push({
      stepName: "2. TERM",
      description: "Ganti setiap terminal di aturan panjang (>1 simbol) dengan variabel baru yang khusus memproduksi terminal tersebut.",
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // ==================== LANGKAH 3: BIN ====================
    // Pecah aturan > 2 simbol menjadi chain biner
    const binRules: ProductionRule[] = [];
    const finalRules: ProductionRule[] = [];

    for (const rule of rules) {
      if (rule.right.length <= 2) {
        finalRules.push(rule);
      } else {
        // A → B1 B2 B3 B4 menjadi:
        // A → B1 X1, X1 → B2 X2, X2 → B3 B4
        let currentLeft = rule.left;
        const symbols = rule.right;
        for (let i = 0; i < symbols.length - 2; i++) {
          const newVar = this.generateNewVar();
          variables.push(newVar);
          finalRules.push({ left: currentLeft, right: [symbols[i], newVar] });
          currentLeft = newVar;
        }
        finalRules.push({ left: currentLeft, right: [symbols[symbols.length - 2], symbols[symbols.length - 1]] });
      }
    }
    rules = finalRules;

    this.steps.push({
      stepName: "3. BIN",
      description: "Pecah aturan dengan lebih dari 2 simbol di sisi kanan menjadi rantai aturan biner (max 2 simbol).",
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // ==================== LANGKAH 4: DEL ====================
    // Hapus ε-productions dan kompensasikan
    const nullable = new Set<Variable>();

    // Temukan semua variabel nullable (yang bisa menghasilkan ε)
    let changed = true;
    while (changed) {
      changed = false;
      for (const rule of rules) {
        if (rule.right.length === 0 || (rule.right.length === 1 && rule.right[0] === EPSILON)) {
          if (!nullable.has(rule.left)) {
            nullable.add(rule.left);
            changed = true;
          }
        }
        if (rule.right.length > 0 && rule.right.every(s => nullable.has(s))) {
          if (!nullable.has(rule.left)) {
            nullable.add(rule.left);
            changed = true;
          }
        }
      }
    }

    // Buat aturan baru untuk setiap kombinasi penghapusan simbol nullable
    const delRules: ProductionRule[] = [];
    for (const rule of rules) {
      // Hapus aturan epsilon langsung
      if (rule.right.length === 0 || (rule.right.length === 1 && rule.right[0] === EPSILON)) {
        continue;
      }

      // Temukan indeks semua simbol nullable di sisi kanan
      const nullablePositions: number[] = [];
      for (let i = 0; i < rule.right.length; i++) {
        if (nullable.has(rule.right[i])) {
          nullablePositions.push(i);
        }
      }

      // Buat semua subset dari posisi nullable
      const subsets = this.getSubsets(nullablePositions);
      for (const subset of subsets) {
        const newRight = rule.right.filter((_, idx) => !subset.includes(idx));
        if (newRight.length > 0) {
          // Hindari duplikat
          const exists = delRules.some(
            r => r.left === rule.left && r.right.join(',') === newRight.join(',')
          );
          if (!exists) {
            delRules.push({ left: rule.left, right: newRight });
          }
        }
      }
    }

    // Jika start variable nullable, tambahkan S0 → ε
    if (nullable.has(cfg.startVariable)) {
      delRules.push({ left: startVariable, right: [] });
    }

    rules = delRules;

    this.steps.push({
      stepName: "4. DEL",
      description: `Hapus ε-productions. Variabel nullable: {${Array.from(nullable).join(', ')}}. Kompensasi dengan semua kemungkinan penghilangan.`,
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // ==================== LANGKAH 5: UNIT ====================
    // Hapus unit productions (A → B dimana B adalah variabel tunggal)
    let unitChanged = true;
    while (unitChanged) {
      unitChanged = false;
      const newRules: ProductionRule[] = [];

      for (const rule of rules) {
        if (rule.right.length === 1 && variables.includes(rule.right[0]) && rule.left !== rule.right[0]) {
          // Ini unit production: A → B
          // Ganti dengan semua produksi B → ...
          const bRules = rules.filter(r => r.left === rule.right[0]);
          for (const bRule of bRules) {
            const exists = newRules.some(
              r => r.left === rule.left && r.right.join(',') === bRule.right.join(',')
            ) || rules.some(
              r => r.left === rule.left && r.right.join(',') === bRule.right.join(',')
            );
            if (!exists) {
              newRules.push({ left: rule.left, right: [...bRule.right] });
              unitChanged = true;
            }
          }
        } else {
          // Bukan unit production, pertahankan
          const exists = newRules.some(
            r => r.left === rule.left && r.right.join(',') === rule.right.join(',')
          );
          if (!exists) {
            newRules.push(rule);
          }
        }
      }
      rules = newRules;
    }

    this.steps.push({
      stepName: "5. UNIT",
      description: "Hapus semua unit productions (A → B). Ganti dengan aturan yang diproduksi oleh B secara langsung.",
      rules: rules.map(r => ({ ...r, right: [...r.right] })),
      variables: [...variables]
    });

    // Bersihkan variabel yang tidak terpakai
    const usedVars = new Set<Variable>();
    usedVars.add(startVariable);
    for (const rule of rules) {
      usedVars.add(rule.left);
      for (const sym of rule.right) {
        if (variables.includes(sym)) usedVars.add(sym);
      }
    }
    variables = variables.filter(v => usedVars.has(v));

    const resultCFG = new CFG(variables, terminals, rules, startVariable);

    return { result: resultCFG, steps: this.steps };
  }

  // Helper: Dapatkan semua subset dari array indeks
  private getSubsets(arr: number[]): number[][] {
    const result: number[][] = [];
    const total = Math.pow(2, arr.length);
    for (let i = 0; i < total; i++) {
      const subset: number[] = [];
      for (let j = 0; j < arr.length; j++) {
        if (i & (1 << j)) {
          subset.push(arr[j]);
        }
      }
      result.push(subset);
    }
    return result;
  }
}
