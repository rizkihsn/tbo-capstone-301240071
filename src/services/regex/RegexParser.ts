// Tipe-tipe Node untuk Abstract Syntax Tree (AST)

export enum NodeType {
  LITERAL,
  CONCAT,
  UNION, // Operator OR (|)
  STAR,  // Operator Kleene Star (*)
}

export abstract class ASTNode {
  abstract type: NodeType;
}

export class LiteralNode extends ASTNode {
  type = NodeType.LITERAL;
  constructor(public value: string) {
    super();
  }
}

export class ConcatNode extends ASTNode {
  type = NodeType.CONCAT;
  constructor(public left: ASTNode, public right: ASTNode) {
    super();
  }
}

export class UnionNode extends ASTNode {
  type = NodeType.UNION;
  constructor(public left: ASTNode, public right: ASTNode) {
    super();
  }
}

export class StarNode extends ASTNode {
  type = NodeType.STAR;
  constructor(public child: ASTNode) {
    super();
  }
}

export class RegexParser {
  private input: string = "";
  private pos: number = 0;

  private peek(): string | null {
    if (this.pos >= this.input.length) return null;
    return this.input[this.pos];
  }

  private consume(): string | null {
    if (this.pos >= this.input.length) return null;
    return this.input[this.pos++];
  }

  private isLiteral(char: string | null): boolean {
    if (!char) return false;
    // Karakter spesial yang bukan literal (operator)
    const specialChars = ['|', '*', '(', ')'];
    return !specialChars.includes(char);
  }

  public parse(regex: string): ASTNode | null {
    if (!regex) return null;
    // Hapus spasi untuk mempermudah (opsional, tergantung spesifikasi)
    this.input = regex.replace(/\s+/g, '');
    this.pos = 0;
    
    if (this.input.length === 0) return null;

    return this.parseExpression();
  }

  // Expression -> Term ('|' Term)*
  private parseExpression(): ASTNode {
    let node = this.parseTerm();

    while (this.peek() === '|') {
      this.consume(); // makan '|'
      const rightNode = this.parseTerm();
      node = new UnionNode(node, rightNode);
    }

    return node;
  }

  // Term -> Factor (Factor)* (Perhatikan implicit concatenation)
  private parseTerm(): ASTNode {
    let node = this.parseFactor();

    // Selama token berikutnya ada dan BUKAN ')' dan BUKAN '|', itu berarti penggabungan (Concatenation)
    while (this.peek() !== null && this.peek() !== '|' && this.peek() !== ')') {
      const rightNode = this.parseFactor();
      node = new ConcatNode(node, rightNode);
    }

    return node;
  }

  // Factor -> Primary ('*')*
  private parseFactor(): ASTNode {
    let node = this.parsePrimary();

    while (this.peek() === '*') {
      this.consume(); // makan '*'
      node = new StarNode(node);
    }

    return node;
  }

  // Primary -> Literal | '(' Expression ')'
  private parsePrimary(): ASTNode {
    const char = this.peek();

    if (char === '(') {
      this.consume(); // makan '('
      
      // Cek tanda kurung kosong
      if (this.peek() === ')') {
        throw new Error("Grup kosong '()' tidak diizinkan. Setiap grup harus berisi ekspresi.");
      }
      
      const node = this.parseExpression();
      if (this.peek() === ')') {
        this.consume(); // makan ')'
      } else {
        throw new Error(`Tanda kurung tutup ')' tidak ditemukan. Pastikan setiap '(' memiliki pasangan ')'.`);
      }
      return node;
    } else if (char === '*') {
      throw new Error(`Operator '*' pada posisi ${this.pos + 1} tidak memiliki operand. '*' harus mengikuti huruf atau grup.`);
    } else if (char === '|') {
      throw new Error(`Operator '|' pada posisi ${this.pos + 1} tidak memiliki operand di sisi kiri.`);
    } else if (this.isLiteral(char)) {
      this.consume(); // makan huruf
      return new LiteralNode(char!);
    } else {
      throw new Error(`Karakter tak terduga '${char}' pada posisi ${this.pos + 1}. Gunakan huruf, angka, atau operator yang didukung (*, |, (), .).`);
    }
  }

  // Utility untuk debugging: Mencetak bentuk AST menjadi string
  public static astToString(node: ASTNode): string {
    if (node instanceof LiteralNode) {
      return node.value;
    } else if (node instanceof ConcatNode) {
      return `Concat(${RegexParser.astToString(node.left)}, ${RegexParser.astToString(node.right)})`;
    } else if (node instanceof UnionNode) {
      return `Union(${RegexParser.astToString(node.left)}, ${RegexParser.astToString(node.right)})`;
    } else if (node instanceof StarNode) {
      return `Star(${RegexParser.astToString(node.child)})`;
    }
    return "";
  }
}
