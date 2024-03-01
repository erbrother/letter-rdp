class Tokenizer {
  constructor() {
    this._string = ''
    this._cursor = 0
  }

  init(string) {
    this._string = string
    this._cursor = 0
  }

  // is End Of File
  isEOF() {
    return this._cursor === this._string.length
  }

  hasMoreTokens() {
    return this._cursor < this._string.length
  }

  getNextToken() {
    if (!this.hasMoreTokens()) {
      return null
    }

    const string = this._string.slice(this._cursor)

    // 如果首字符是数字
    if (!Number.isNaN(Number(string[0]))) {
      let number = ''

      while (!Number.isNaN(Number(string[this._cursor]))) {
        number += string[this._cursor]
        this._cursor++
      }

      return {
        type: 'NUMBER',
        value: Number(number),
      }
    }

    // String
    if (string[0] === '"') {
      let s = '';

      do {
        s += string[this._cursor++]
      } while (string[this._cursor] !== '"' && !this.isEOF())
      
      // skip the ending quote `"hello"` => "hello6
      s+= this._cursor++;

      return {
        type: 'STRING',
        value: s,
      }
    }


    return null
  }
}

module.exports = {
  Tokenizer,
}
