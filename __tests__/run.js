const { Parser} = require('../src/Parser.js')

const parser = new Parser()

const program = ` 
  /**
   *  "Hello, World!
   */         
  " 52";
  
  // number:
  42;
`

const ast = parser.parse(program)

console.log(JSON.stringify(ast, null, 2))