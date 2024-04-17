/**
 * Tokenizer Specification
 */
const Spec = [
  // --------------------
  // 0. WHITESPACE
  [/^\s+/, null],

  // --------------------
  // Comments

  // Skip single line comment
  [/^\/\/.*/, null],

  // Skip multi-line comments
  [/^\/\*[\s\S]*?\*\//, null],

  // --------------
  // Symbols delimiters:
  [/^;/, ';'],
  [/^\{/, '{'],
  [/^\}/, '}'],
  [/^\(/, '('],
  [/^\)/, ')'],
  [/^\,/, ','],

  // --------------------
  // Keywords
  [/^\blet\b/, 'let'],
  [/^\bif\b/, 'if'],
  [/^\belse\b/, 'else'],

  // --------------------
  // 1. NUMBER
  [/^\d+/, 'NUMBER'],

  // --------------------
  // Identifiers
  [/^\w+/, 'IDENTIFIER'],

  // --------------------
  // Assigment operators: =, *=, /=, +=, -=,
  [/^=/, 'SIMPLE_ASSIGN'],
  [/^[\*\/\+\-]=/, 'COMPLEX_ASSIGN'],

  // --------------
  // Math operators: + , -, *, /,
  [/^[+\-]/, 'ADDITIVE_OPERATOR'],
  [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],

  // --------------
  // Relational operators: <, >, <=, >=
  [/^[><]=?/, 'RELATIONAL_OPERATOR'],

  // --------------------
  // 2. STRING
  [/^"[^"]*"/, 'STRING'],
  [/^'[^']*'/, 'STRING']
];

class Tokenizer {
  constructor() {
    this._string = '';
    this._cursor = 0;
  }

  init(string) {
    this._string = string;
    this._cursor = 0;
  }

  // is End Of File
  isEOF() {
    return this._cursor === this._string.length;
  }

  hasMoreTokens() {
    return this._cursor < this._string.length;
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null;
    }

    const string = this._string.slice(this._cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this._match(regexp, string);

      if (tokenValue == null) {
        continue;
      }

      // Should skip token e.g. whitespace
      if (tokenType == null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue
      };
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`);
  }

  _match(regexp, string) {
    const matched = regexp.exec(string);

    if (matched == null) {
      return null;
    }

    this._cursor += matched[0].length;
    return matched[0];
  }
}

module.exports = {
  Tokenizer
};
