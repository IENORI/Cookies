var should = require('should');
var request = require('request');
var expect = require('chai').expect;
var chai = require('chai');
var util = require('util');

describe('sign in unit test', function () {
  // testing sign in function
  describe('recaptcha fail verify test', function () {
    it('recaptcha return 401 error code', function (done) {
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
          done();
        }
      );
    });
  });

  // testing recaptcha pass. api key is testing key not actual key
  describe('captcha pass test', function () {
    it('recaptcha return should be success', function (done) {
      request.post(
        {
          url: 'https://www.google.com/recaptcha/api/siteverify?secret=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe&response=anytoken',
        },
        function (error, response, body) {
          expect(response.statusCode).to.equal(200);
          expect(JSON.parse(response.body).success).to.equal(true);
          done();
        }
      );
    });
  });
});
