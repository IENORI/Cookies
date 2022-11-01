import request from 'request';
import chai from 'chai';
import signInFunction from '../functions/signInFunction.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
const expect = chai.expect;


dotenv.config(); //to fetch variables

/*mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database!");
  })*/

describe('sign in unit test', function () {
  // testing invalid captcha
  describe('Captcha test', function () {
    it('Captcha should fail', async function () {
      const result = await signInFunction.verifyCaptcha('invalidToken');
      expect(result).to.equal('Captcha Error');
    });
  });

    // testing email validation
    describe('Valid input fields test', function () {
      it('Result should be valid', function () {
        const result = signInFunction.validateSignInFields('testUser@gmail.com', "Testpassword1");
        expect(result).to.equal("valid");
      });
    });

  // testing email validation
  describe('Invalid email test', function () {
    it('Result should be Invalid', function () {
      const result = signInFunction.validateSignInFields("testUser@", "Testpassword1");
      expect(result).to.equal('Invalid email format!');
    });
  });

  // testing email validation
  describe('Invalid password test', function () {
    it('Result should be Invalid', function () {
      const result = signInFunction.validateSignInFields("testUser@gmail.com", "Testpassword");
      expect(result).to.equal('Invalid password1 format!');
    });
  });

  // testing empty field
  describe('empty email field test', function () {
    it('Result should not be valid', function () {
      const result = signInFunction.validateSignInFields("", "Testpassword");
      expect(result).to.not.equal('valid');
    });
  });

  // testing empty field
  describe('empty password field test', function () {
    it('Result should not be valid', function () {
      const result = signInFunction.validateSignInFields("testUser@gmail.com", "");
      expect(result).to.not.equal('valid');
    });
  });
  

  /*
  // testing if email and password exist in db
  describe('Valid user test with correct credentials', function () {
    it('Result should not be null', async function () {
      const result = await signInFunction.validEmailPassword('donotdelete@gmail.com', "Password123");
      expect(result).to.not.equal(null);
    });
  });

    // testing if email and password exist in db
    describe('Invalid user test with valid email but invalid password', function () {
      it('Result should be null', async function () {
        const result = await signInFunction.validEmailPassword('donotdelete@gmail.com', "WrongPassword");
        expect(result).to.equal(null);
      });
    });

    // testing if email and password exist in db
    describe('Invalid user test with invalid email but valid password', function () {
      it('Result should be null', async function () {
        const result = await signInFunction.validEmailPassword('wronguser@gmail.com', "Password123");
        expect(result).to.equal(null);
      });
    });
    */

});
