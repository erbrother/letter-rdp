const { Parser } = require('../src/Parser.js');
const assert = require('assert');

/**
 * List of tests
 */

const tests = [
  // require("./literals-test.js"),
  // require("./statement-list-test.js"),
  // require("./block-test.js"),
  // require("./empty-statement-test.js"),
  // require('./math-test.js'),
  // require('./assignment-test.js'),
  // require('./variable-test.js'),
  // require('./if-test.js'),
  // require('./relational-test.js'),
  // require('./equality-test.js'),
  // require('./logical-test.js'),
  // require('./unary-test.js'),
  // require('./while-test.js'),
  // require('./do-while-test.js'),
  // require('./function-declaration-test.js'),
  require('./member-test.js'),
];

const parser = new Parser();

function exec() {
  const program = `
    let s = "Hello, world!";
    let i = 0;

    while (i < s.length) {
      s[i];
      // console.log(i, s[i]);
      i += 1;
    }
  `;

  const ast = parser.parse(program);

  console.log(JSON.stringify(ast, null, 2));
}

function test(program, expected) {
  const ast = parser.parse(program);

  assert.deepEqual(ast, expected);
}

console.log('Running tests...');

tests.forEach((testRun) => testRun(test));

console.log('success !!!');

// Manual test
exec();
