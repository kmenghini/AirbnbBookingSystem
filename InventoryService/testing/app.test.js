const app = require('../app.js');
const request = require('supertest');

describe('Test the /inventory/:listingId path', () => {
  test('It should respond to the GET method in the correct format', (done) => {
      request(app).get('/inventory/a883f66c-c483-4205-b423-eb23adb77293').then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.res.text).toBe('{"id":"a883f66c-c483-4205-b423-eb23adb77293","hostid":"361d64b8-97cb-4239-9d9f-72928b0edf9f","name":"Sharable Castle in Dandreburgh","superbool":true}');
          done();
      });
  });
  test('It should respond with error message on invalid listing', (done) => {
    request(app).get('/inventory/0000').then((response) => {
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.res.text).name).toBe('ResponseError');
        done();
    });
  });
});