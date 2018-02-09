const app = require('../app.js');



test('endpoint /inventory/:listingId should return correct results in correct format')


test('adds 1 + 2 to equal 3', () => {
  expect(app.sum(1, 2)).toBe(3);
});

test('object assignment', () => {
  const data = {one: 1};
  data['two'] = 2;
  expect(data).toEqual({one: 1, two: 2});
});

test('adding positive numbers is not zero', () => {
  for (let a = 1; a < 10; a++) {
    for (let b = 1; b < 10; b++) {
      expect(a + b).not.toBe(0);
    }
  }
});

test('null', () => {
  const n = null;
  expect(n).toBeNull();
  expect(n).toBeDefined();
  expect(n).not.toBeUndefined();
  expect(n).not.toBeTruthy();
  expect(n).toBeFalsy();
});

test('two plus two', () => {
  const value = 2 + 2;
  expect(value).toBeGreaterThan(3);
  expect(value).toBeGreaterThanOrEqual(3.5);
  expect(value).toBeLessThan(5);
  expect(value).toBeLessThanOrEqual(4.5);
});

test('but there is a "stop" in Christoph', () => {
  expect('Christoph').toMatch(/stop/);
});

const shoppingList = [
  'diapers',
  'kleenex',
  'trash bags',
  'paper towels',
  'beer',
];

test('the shopping list has beer on it', () => {
  expect(shoppingList).toContain('beer');
});

// function compileAndroidCode() {
//   throw new ConfigError('you are using the wrong JDK');
// }

// test('compiling android goes as expected', () => {
//   expect(compileAndroidCode).toThrow();
//   expect(compileAndroidCode).toThrow(ConfigError);

//   // You can also use the exact error message or a regexp
//   expect(compileAndroidCode).toThrow('you are using the wrong JDK');
//   expect(compileAndroidCode).toThrow(/JDK/);
// });

// test('the data is peanut butter', done => {
//   function callback(data) {
//     expect(data).toBe('peanut butter');
//     done();
//   }
//   fetchData(callback);
// });

// beforeEach(() => {  
// });

// afterEach(() => {
// });

// beforeAll(() => {
// });

// afterAll(() => {
// });
