import request from 'request';
import chai from 'chai';
const expect = chai.expect;
import signUpFunction from '../functions/signUpFunction.js';

describe('register account unit test', function () {
  // testing invalid name field
  describe('Validate sign up fields test', function () {
    it('Result should be invalid name format', function () {
      const result =  signUpFunction.validateSignUpFields("testname1", "test@gmail.com", "Password", "Password");
      expect(result).to.equal('Invalid name format!');
    });
  });

  // testing invalid email field
  describe('Validate sign up fields test', function () {
    it('Result should be invalid email format', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@", "Testpassword1", "Testpassword1");
      expect(result).to.equal('Invalid email format!');
    });
  });

  // testing invalid password field
  describe('Validate sign up fields test', function () {
    it('Result should be invalid password1 format', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@gmail.com", "testpassword", "testpassword");
      expect(result).to.equal('Invalid password1 format!');
    });
  });

  // testing unmatching password fields
  describe('Validate sign up fields test', function () {
    it('Result should be invalid password2 format', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@gmail.com", "Testpassword1", "Testpassword2");
      expect(result).to.equal('Invalid password2 format!');
    });
  });

  // testing valid sign up fields
  describe('Validate sign up fields test', function () {
    it('Result should be valid', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@gmail.com", "Testpassword1", "Testpassword1");
      expect(result).to.equal('valid');
    });
  });

  // testing valid sign up fields
  describe('Empty name field test', function () {
    it('Result should not be valid', function () {
      const result =  signUpFunction.validateSignUpFields("", "test@gmail.com", "Testpassword1", "Testpassword1");
      expect(result).to.not.equal('valid');
    });
  });

  // testing valid sign up fields
  describe('Empty email field test', function () {
    it('Result should not be valid', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "", "Testpassword1", "Testpassword1");
      expect(result).to.not.equal('valid');
    });
  });

  // testing valid sign up fields
  describe('Empty password field test', function () {
    it('Result should not be valid', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@gmail.com", "", "Testpassword1");
      expect(result).to.not.equal('valid');
    });
  });

  // testing valid sign up fields
  describe('Empty confirm password field test', function () {
    it('Result should not be valid', function () {
      const result =  signUpFunction.validateSignUpFields("testname", "test@gmail.com", "Testpassword1", "");
      expect(result).to.not.equal('valid');
    });
  });
});