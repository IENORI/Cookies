import chai from 'chai';
import forgotPasswordFunction from '../functions/forgotPasswordFunction.js';
const expect = chai.expect;

describe('forgot password unit test', function () {
  // testing email validation
  describe('Valid email test', function () {
    it('result should be undefined', function () {
      const result = forgotPasswordFunction.validateEmail('testUser@gmail.com');
      expect(result).to.equal(undefined);
    });
  });

  // testing email validation
  describe('Invalid email test', function () {
    it('Email should be Invalid', function () {
      const result = forgotPasswordFunction.validateEmail('testUser@');
      expect(result).to.equal('Invalid email format!');
    });
  });

// testing email validation
    describe('Empty email test', function () {
        it('Email should be Invalid', function () {
            const result = forgotPasswordFunction.validateEmail('');
            expect(result).to.not.equal(undefined);
        });
    });
  
});
