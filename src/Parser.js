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

  /**
   * 在代码中，根据输入的情况执行不同的操作，
   * 比如当输入是分号 ";" 时，执行 EmptyStatement() 函数；
   * 当输入是左大括号 "{" 时，执行 BlockStatement() 函数；
   * 其他情况下，执行 ExpressionStatement() 函数。
   * 这段代码的作用是根据输入的不同情况返回相应的语句或操作。
   *  */
  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()]

    while (this._lookahead !== null && this._lookahead.type !== stopLookahead) {
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
      case 'let':
        return this.VariableStatement()
      default:
        return this.ExpressionStatement()
    }
  }

  VariableStatement() {
    this._eat('let')

    const declarations = this.VariableDeclarationList()

    this._eat(';')

    return {
      type: 'VariableStatement',
      kind: 'let',
      declarations,
    }
  }

  VariableDeclarationList() {
    const declarations = [this.VariableDeclaration()]

    while (this._lookahead.type === ',' && this._eat(',')) {
      declarations.push(this.VariableDeclaration())
    }

    return declarations
  }

  VariableDeclaration() {
    const id = this.Identifier()
    const init =
      this._lookahead.type !== ';' && this._lookahead.type !== ','
        ? this.VariableInitializer()
        : null
    return {
      type: 'VariableDeclaration',
      id,
      init,
    }
  }

  VariableInitializer() {
    this._eat('SIMPLE_ASSIGN')

    return this.AssignmentExpression()
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
    return this.AssignmentExpression()
  }

  AssignmentExpression() {
    const left = this.AddtiveExpression()

    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left
    }

    return {
      type: 'AssignmentExpression',
      operator: this._eat(this._lookahead.type).value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
    }
  }

  /**
   * x = 1;
   *
   */
  LeftHandSideEexpression() {
    return this.Identifier()
  }

  /**
   * Identifier
   *
   * @return {Object} { type: 'Identifier', name: 'x' }
   */
  Identifier() {
    const identifier = this._eat('IDENTIFIER')
    const name = identifier.value

    return {
      type: 'Identifier',
      name,
    }
  }

  /**
   * Extra check whether it's a valid assignment target
   *
   * @param {*} node
   * @returns node
   */
  _checkValidAssignmentTarget(node) {
    if (node.type === 'Identifier') {
      return node
    }

    throw new SyntaxError('Invalid left-hand side in assignment express')
  }

  _isAssignmentOperator(tokenType) {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN'
  }

  AssignmentOperator() {}

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
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal()
    }

    switch (this._lookahead.type) {
      case '(':
        return this.ParenthesizedExpression()
      default:
        return this.LeftHandSideEexpression()
    }
  }

  /**
   * 是否是字面量 String Number
   * @returns
   */
  _isLiteral(tokenType) {
    return (
      this._lookahead.type === 'NUMBER' || this._lookahead.type === 'STRING'
    )
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
