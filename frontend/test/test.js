var should = require('should');
var request = require('request');
var expect = require('chai').expect;
var util = require('util');

// testing sign in function
describe('captcha error test', function () {
  it('captcha error test', function (done) {
    request.post(
      {
        url: 'http://localhost:5000/api/users/signin',
        form: {
          token: 'invalid_token',
          email: 'JC@email.com',
          password: 'test_password',
        },
      },
      function (error, response, body) {
        expect(response.statusCode).to.equal(401);
        console.log(body);
        done();
      }
    );
  });
});
