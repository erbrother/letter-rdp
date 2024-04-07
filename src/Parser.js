const { Tokenizer } = require('./Tokenizer')

class Parser {
  constructor() {
    this._tokenizer = new Tokenizer()
  }

  parse(string) {
    this._string = string
    this._tokenizer.init(string)

    this._lookahead = this._tokenizer.getNextToken()

    return this.Program()
  }

  Program() {
    return {
      type: 'Program',
      body: this.StatementList(),
    }
  }

  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()]

    while (this._lookahead != null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement())
    }

    return statementList
  }

  Statement() {
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement()
      case '{':
        return this.BlockStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  EmptyStatement() {
    this._eat(';')

    return {
      type: 'EmptyStatement',
    }
  }

  BlockStatement() {
    this._eat('{')

    const body = this._lookahead.type !== '}' ? this.StatementList('}') : []

    this._eat('}')

    return {
      type: 'BlockStatement',
      body,
    }
  }

  ExpressionStatement() {
    const expression = this.Expression()
    this._eat(';')

    return {
      type: 'ExpressionStatement',
      expression,
    }
  }

  Expression() {
    return this.AddtiveExpression()
  }

  AddtiveExpression() {
    return this._BinaryExpression(
      'MultiplicativeExpression',
      'ADDITIVE_OPERATOR'
    )
  }

  MultiplicativeExpression() {
    return this._BinaryExpression(
      'PrimaryExpression',
      'MULTIPLICATIVE_OPERATOR'
    )
  }

  _BinaryExpression(builder, operatorToken) {
    let left = this[builder]()

    while (this._lookahead.type === operatorToken) {
      // Operat: + or -
      const operator = this._eat(operatorToken).value

      // Right side of the operator
      const right = this[builder]()

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      }
    }

    return left
  }

  PrimaryExpression() {
    switch (this._lookahead.type) {
      case '(':
        return this.ParenthesizedExpression()
      default:
        return this.Literal()
    }
  }

  ParenthesizedExpression() {
    this._eat('(')

    const expression = this.Expression()

    this._eat(')')

    return expression
  }

  Literal() {
    switch (this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral()
      case 'STRING':
        return this.StringLiteral()
    }

    throw new SyntaxError('Unexpected token: ' + this._lookahead.value)
  }

  NumericLiteral() {
    const token = this._eat('NUMBER')

    return {
      type: 'NumericLiteral',
      value: Number(token.value),
    }
  }

  StringLiteral() {
    const token = this._eat('STRING')

    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1),
    }
  }

  _eat(type) {
    const token = this._lookahead

    if (token == null) {
      throw new SyntaxError(`Unexpected end of input, expected ${type}`)
    }

    if (token.type !== type) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${type}"`
      )
    }

    this._lookahead = this._tokenizer.getNextToken()

    return token
  }
}

module.exports = {
  Parser,
}
