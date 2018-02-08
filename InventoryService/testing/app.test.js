const app = require('../app.js');


//test endpoint 


test('adds 1 + 2 to equal 3', () => {
  expect(app.sum(1, 2)).toBe(3);
});

test('two plus two is four', () => {
  expect(2 + 2).toBe(4);
});