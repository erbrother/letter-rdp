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
  // require('./relational.js'),
  // require('./equality-test.js'),
  // require('./logical-test.js'),
  require('./unary-test.js')
];

const parser = new Parser();

function exec() {
  const program = `
    --x;
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
