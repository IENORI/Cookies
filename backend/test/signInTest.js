import request from 'request';
import chai from 'chai';
import signInFunction from '../functions/signInFunction.js';
const expect = chai.expect;

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
        }
      );
      done();
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

  // testing invalid input fields
  describe('invalid email input test', function () {
    it("sign in api should return 'Invalid email format!'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signintest',
          form: {
            email: 'testinvalidemail',
            password: 'test_password',
            token: 'test_token',
          },
        },
        function (error, response, body) {
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email format!'
          );
        }
      );
      done();
    });
  });

  // testing non-exists email
  describe('Invalid user test', function () {
    it("sign in api should return 'Invalid email or password'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signintest',
          form: {
            token: 'test_token',
            email: 'test@email.com',
            password: 'test_password',
          },
        },
        function (error, response, body) {
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email or password'
          );
        }
      );
      done();
    });
  });

  // testing valid email/password credentials
  describe('Valid email and password test', function () {
    it('sign in api should return user id and email', function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signintest',
          form: {
            token: 'test_token',
            email: 'testuser@gmail.com',
            password: 'Password123',
          },
        },
        function (error, response, body) {
          expect(
            JSON.parse(response.body).hasOwnProperty('_id', 'email')
          ).to.equal(true);
        }
      );
      done();
    });
  });

  // testing unexists email or wrong password
  describe('User does not exist test', function () {
    it("sign in api should return 'Invalid email or password'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signintest',
          form: {
            token: 'test_token',
            email: 'testuser@gmail.com',
            password: 'test_password',
          },
        },
        function (error, response, body) {
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email or password'
          );
        }
      );
      done();
    });
  });

  // testing OTP with valid user
  describe('Registered user generating OTP', function () {
    it("sign in api should return 'Code resend'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/resendcode',
          form: {
            userId: '635e74714a969cb611cf4f63',
          },
        },
        function (error, response, body) {
          expect(response.body).to.equal('Code resend');
        }
      );
      done();
    });
  });

  // testing OTP with invalid user
  describe('Non-exst user generating OTP', function () {
    it('sign in api should return 500 error code', function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/resendcode',
          form: {
            userId: '635e74714a969cb611c2sf12',
          },
        },
        function (error, response, body) {
          expect(response.statusCode).to.equal(500);
        }
      );
      done();
    });
  });

  // testing invalid captcha
  describe('Captcha test', function () {
    it('verify captcha fail', async function () {
      const result = await signInFunction.verifyCaptcha('invalidToken');
      expect(result).to.equal('Captcha Error');
    });
  });
});
