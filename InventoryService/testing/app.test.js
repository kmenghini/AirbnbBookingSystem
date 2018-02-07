const app = require('../app.js');

test('adds 1 + 2 to equal 3', () => {
  expect(app.sum(1, 2)).toBe(3);
});