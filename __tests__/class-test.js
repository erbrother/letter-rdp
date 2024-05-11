module.exports = test => {
  test(`
    class Point  {
      def constructor(x, y) {
        this.x = x;
        this.y = y;
      }

      def calc() {
        return this.x + this.y;
      }
    }
  `, {
    type: 'Program',
    body: [
      {
        type: 'ClassDeclaration',
        id: {
          type: 'Identifier',
          name: 'Point'
        },
        superClass: null,
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'constructor'
              },
              params: [
                {
                  type: 'Identifier',
                  name: 'x'
                },
                {
                  type: 'Identifier',
                  name: 'y'
                }
              ],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        object: {
                          type: 'ThisExpression'
                        },
                        property: {
                          type: 'Identifier',
                          name: 'x'
                        }
                      },
                      right: {
                        type: 'Identifier',
                        name: 'x'
                      }
                    }
                  },
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'AssignmentExpression',
                      operator: '=',
                      left: {
                        type: 'MemberExpression',
                        object: {
                          type: 'ThisExpression'
                        },
                        property: {
                          type: 'Identifier',
                          name: 'y'
                        }
                      },
                      right: {
                        type: 'Identifier',
                        name: 'y'
                      }
                    }
                  }
                ]
              }
            },
            {
              type: 'FunctionDeclaration',
              name: {
                type: 'Identifier',
                name: 'calc'
              },
              params: [],
              body: {
                type: 'BlockStatement',
                body: [
                  {
                    type: 'ReturnStatement',
                    argument: {
                      type: 'BinaryExpression',
                      operator: '+',
                      left: {
                        type: 'MemberExpression',
                        object: {
                          type: 'ThisExpression'
                        },
                        property: {
                          type: 'Identifier',
                          name: 'x'
                        }
                      },
                      right: {
                        type: 'MemberExpression',
                        object: {
                          type: 'ThisExpression'
                        },
                        property: {
                          type: 'Identifier',
                          name: 'y'
                        }
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  })

  // New expression;
  test(`
    new Point(1, 2)
  `,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'NewExpression',
            callee: {
              type: 'Identifier',
              name: 'Point'
            },
            arguments: [
              {
                type: 'NumericLiteral',
                value: 1
              },
              {
                type: 'NumericLiteral',
                value: 2
              }
            ]
          }
        }
      ]
    }
  )

}