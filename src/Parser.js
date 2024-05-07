const { Tokenizer } = require('./Tokenizer');

class Parser {
  constructor() {
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.init(string);

    this._lookahead = this._tokenizer.getNextToken();

    return this.Program();
  }

  Program() {
    return {
      type: 'Program',
      body: this.StatementList()
    };
  }

  /**
   * 在代码中，根据输入的情况执行不同的操作，
   * 比如当输入是分号 ";" 时，执行 EmptyStatement() 函数；
   * 当输入是左大括号 "{" 时，执行 BlockStatement() 函数；
   * 其他情况下，执行 ExpressionStatement() 函数。
   * 这段代码的作用是根据输入的不同情况返回相应的语句或操作。
   *  */
  StatementList(stopLookahead = null) {
    const statementList = [this.Statement()];

    while (this._lookahead !== null && this._lookahead.type !== stopLookahead) {
      statementList.push(this.Statement());
    }

    return statementList;
  }

  Statement() {
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement();
      case 'if':
        return this.IfStatement();
      case '{':
        return this.BlockStatement();
      case 'let':
        return this.VariableStatement();
      case 'return':
        return this.ReturnStatement();
      case 'def':
        return this.FunctionDeclaration();
      case 'while':
      case 'do':
      case 'for':
        return this.IterationStatement();
      default:
        return this.ExpressionStatement();
    }
  }

  /**
   * FunctionDeclaration() 函数用来解析函数声明。
   * : 'def' Identifier '(' FormalParameters ')' BlockStatement
   */
  FunctionDeclaration() {
    this._eat('def');

    const name = this.Identifier();

    this._eat('(');

    const params = this._lookahead.type !== ')' ? this.FormalParameters() : [];

    this._eat(')');

    const body = this.BlockStatement();

    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body
    };
  }

  /**
   * FormalParameters() 函数用来解析形参。
   * : Identifier (',' Identifier)*
   * @returns
   */
  FormalParameters() {
    const params = [this.Identifier()];

    while (this._lookahead.type === ',') {
      this._eat(',');

      params.push(this.Identifier());
    }

    return params;
  }

  /**
   * ReturnStatement() 函数用来解析 return 语句。
   * : 'return' Expression ';'
   */

  ReturnStatement() {
    this._eat('return');

    const argument = this._lookahead.type !== ';' ? this.Expression() : null;

    this._eat(';');

    return {
      type: 'ReturnStatement',
      argument
    };
  }

  /**
   * IterationStatement() 函数用来解析循环语句。
   * : WhileStatement
   *  | DoWhileStatement
   *  | ForStatement
   * @returns
   */
  IterationStatement() {
    switch (this._lookahead.type) {
      case 'while':
        return this.WhileStatement();
      case 'do':
        return this.DoWhileStatement();
      case 'for':
        return this.ForStatement();
    }
  }

  /**
   * WhileStatement() 函数用来解析 while 语句。
   * : 'while' '(' Expression ')' Statement
   * ;
   */
  WhileStatement() {
    this._eat('while');

    this._eat('(');

    const test = this.Expression();

    this._eat(')');

    const body = this.Statement();

    return {
      type: 'WhileStatement',
      test,
      body
    };
  }

  /**
   * DoWhileStatement() 函数用来解析 do-while 语句。
   * : 'do' Statement 'while' '(' Expression ')' ';'
   */
  DoWhileStatement() {
    this._eat('do');

    const body = this.Statement();

    this._eat('while');

    this._eat('(');

    const test = this.Expression();

    this._eat(')');

    this._eat(';');

    return {
      type: 'DoWhileStatement',
      body,
      test
    };
  }

  /**
   * ForStatement() 函数用来解析 for 语句。
   * : 'for' '(' Expression? ';' Expression? ';' Expression? ')' Statement
   */
  ForStatement() {
    this._eat('for');

    this._eat('(');

    const init = this._lookahead.type === ';' ? null : this.ForStatementInit();

    this._eat(';');

    const test = this._lookahead.type === ';' ? null : this.Expression();

    this._eat(';');

    const update = this._lookahead.type === ')' ? null : this.Expression();

    this._eat(')');

    const body = this.Statement();

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body
    };
  }

  ForStatementInit() {
    if (this._lookahead.type === 'let') {
      return this.VariableStatementInit();
    } else {
      return this.Expression();
    }
  }

  /**
   * IfStatement() 函数用来解析 if 语句。
   *
   * @returns
   */
  IfStatement() {
    this._eat('if');

    this._eat('(');

    const test = this.Expression();

    this._eat(')');

    const consequent = this.Statement();

    const alternate =
      this._lookahead != null && this._lookahead.type === 'else'
        ? this._eat('else') && this.Statement()
        : null;

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate
    };
  }

  VariableStatementInit() {
    this._eat('let');
    const declarations = this.VariableDeclarationList();

    return {
      type: 'VariableStatement',
      declarations
    };
  }

  VariableStatement() {
    const variableStatement = this.VariableStatementInit();

    this._eat(';');

    return variableStatement;
  }

  VariableDeclarationList() {
    const declarations = [this.VariableDeclaration()];

    while (this._lookahead.type === ',' && this._eat(',')) {
      declarations.push(this.VariableDeclaration());
    }

    return declarations;
  }

  VariableDeclaration() {
    const id = this.Identifier();
    const init =
      this._lookahead.type !== ';' && this._lookahead.type !== ','
        ? this.VariableInitializer()
        : null;
    return {
      type: 'VariableDeclaration',
      id,
      init
    };
  }

  VariableInitializer() {
    this._eat('SIMPLE_ASSIGN');

    return this.AssignmentExpression();
  }

  EmptyStatement() {
    this._eat(';');

    return {
      type: 'EmptyStatement'
    };
  }

  BlockStatement() {
    this._eat('{');

    const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

    this._eat('}');

    return {
      type: 'BlockStatement',
      body
    };
  }

  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(';');

    return {
      type: 'ExpressionStatement',
      expression
    };
  }

  Expression() {
    return this.AssignmentExpression();
  }

  AssignmentExpression() {
    const left = this.LogicalORExpression();

    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }

    return {
      type: 'AssignmentExpression',
      operator: this.AssignmentOperator().value,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression()
    };
  }

  LogicalORExpression() {
    return this._logicalExpression('LogicalANDExpression', 'LOGICAL_OR');
  }

  /**
   * LogicalExpression: 逻辑表达式
   * 逻辑运算符：'&&' | '||'
   * x && y
   *
   * @returns
   */
  LogicalANDExpression() {
    return this._logicalExpression('EqualityExpression', 'LOGICAL_AND');
  }

  EqualityExpression() {
    return this._BinaryExpression('RelationalExpression', 'EQUALITY_OPERATOR');
  }

  /**
   * RELATIONAL_OPERATOR: '<' | '>' | '<=' | '>=' 关系表达式
   *
   * x > y
   *
   * @returns
   */
  RelationalExpression() {
    return this._BinaryExpression('AddtiveExpression', 'RELATIONAL_OPERATOR');
  }

  /**
   * UnaryExpression: 一元表达式
   * 一元运算符：'+' | '-' | '++' | '--' | '!' | '~'
   * : LeftHandSideExpression
   *  | ADDITIVE_OPERATOR UnaryExpression
   *  | LOGICAL_NOT UnaryExpression
   */
  UnaryExpression() {
    let operator;

    switch (this._lookahead.type) {
      case 'ADDITIVE_OPERATOR':
        operator = this._eat('ADDITIVE_OPERATOR').value;
        break;
      case 'LOGICAL_NOT':
        operator = this._eat('LOGICAL_NOT').value;
        break;
    }

    if (operator != null) {
      return {
        type: 'UnaryExpression',
        operator,
        argument: this.UnaryExpression()
      };
    }

    return this.LeftHandSideExpression();
  }

  /**
   * x = 1;
   *
   */
  LeftHandSideExpression() {
    return this.MemberExpression();
  }

  MemberExpression() {
    let object = this.PrimaryExpression();

    while (this._lookahead.type === '[' || this._lookahead.type === '.') {
      if (this._lookahead.type === '.') {
        this._eat('.');

        const property = this.Identifier();
        object = {
          type: 'MemberExpression',
          computed: false,
          object,
          property:property
        };
      }

      if (this._lookahead.type === '[') {
        this._eat('[');

        const property = this.Expression();

        this._eat(']');

        object = {
          type: 'MemberExpression',
          computed: true,
          object,
          property
        };
      }
    }

    return object;
  }

  /**
   * Identifier
   *
   * @return {Object} { type: 'Identifier', name: 'x' }
   */
  Identifier() {
    const identifier = this._eat('IDENTIFIER');
    const name = identifier.value;

    return {
      type: 'Identifier',
      name
    };
  }

  /**
   * Extra check whether it's a valid assignment target
   *
   * @param {*} node
   * @returns node
   */
  _checkValidAssignmentTarget(node) {
    if (node.type === 'Identifier' || node.type === 'MemberExpression') {
      return node;
    }

    throw new SyntaxError('Invalid left-hand side in assignment express');
  }

  _isAssignmentOperator(tokenType) {
    return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
  }

  AssignmentOperator() {
    if (this._lookahead.type === 'SIMPLE_ASSIGN') {
      return this._eat('SIMPLE_ASSIGN');
    }

    return this._eat('COMPLEX_ASSIGN');
  }

  AddtiveExpression() {
    return this._BinaryExpression(
      'MultiplicativeExpression',
      'ADDITIVE_OPERATOR'
    );
  }

  MultiplicativeExpression() {
    return this._BinaryExpression('UnaryExpression', 'MULTIPLICATIVE_OPERATOR');
  }

  _logicalExpression(builder, operatorToken) {
    let left = this[builder]();

    while (this._lookahead.type === operatorToken) {
      const operator = this._eat(operatorToken).value;

      const right = this[builder]();

      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right
      };
    }

    return left;
  }

  // 二元表达式
  _BinaryExpression(builder, operatorToken) {
    let left = this[builder]();

    while (this._lookahead.type === operatorToken) {
      // Operat: + or -
      const operator = this._eat(operatorToken).value;

      // Right side of the operator
      const right = this[builder]();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right
      };
    }

    return left;
  }

  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }

    switch (this._lookahead.type) {
      case '(':
        return this.ParenthesizedExpression();
      case 'IDENTIFIER':
        return this.Identifier();
      default:
        return this.LeftHandSideExpression();
    }
  }

  /**
   * 是否是字面量 String Number
   * @returns
   */
  _isLiteral(tokenType) {
    return (
      tokenType === 'NUMBER' ||
      tokenType === 'STRING' ||
      tokenType === 'true' ||
      tokenType === 'false' ||
      tokenType === 'null'
    );
  }

  ParenthesizedExpression() {
    this._eat('(');

    const expression = this.Expression();

    this._eat(')');

    return expression;
  }

  /**
   * Literal
   *  : NumericLiteral
   *  | StringLiteral
   *  | BooleanLiteral
   *  | NullLiteral
   * ;
   */
  Literal() {
    switch (this._lookahead.type) {
      case 'NUMBER':
        return this.NumericLiteral();
      case 'STRING':
        return this.StringLiteral();
      case 'true':
        return this.BooleanLiteral(true);
      case 'false':
        return this.BooleanLiteral(false);
      case 'null':
        return this.NullLiteral();
    }

    throw new SyntaxError('Unexpected token: ' + this._lookahead.value);
  }

  NumericLiteral() {
    const token = this._eat('NUMBER');

    return {
      type: 'NumericLiteral',
      value: Number(token.value)
    };
  }

  StringLiteral() {
    const token = this._eat('STRING');

    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1)
    };
  }

  BooleanLiteral(value) {
    this._eat(value ? 'true' : 'false');

    return {
      type: 'BooleanLiteral',
      value
    };
  }

  NullLiteral() {
    this._eat('null');

    return {
      type: 'NullLiteral',
      value: null
    };
  }

  _eat(type) {
    const token = this._lookahead;

    if (token == null) {
      throw new SyntaxError(`Unexpected end of input, expected ${type}`);
    }

    if (token.type !== type) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${type}"`
      );
    }

    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }
}

module.exports = {
  Parser
};
