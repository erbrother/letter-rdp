module.exports = (test) => {
  test(`let x = 42;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: {
              type: 'NumericLiteral',
              value: 42,
            },
          },
        ],
      },
    ],
  })

  // VariableStatement no init
  test(`let x;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: null,
          },
        ],
      },
    ],
  })

  // Multiple VariableDeclaration
  test(`let x, y = 42;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        kind: 'let',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: null,
          },
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'y',
            },
            init: {
              type: 'NumericLiteral',
              value: 42,
            },
          },
        ],
      },
    ],
  })

  
}
