import request from 'request';
import chai from 'chai';
const expect = chai.expect;
import updateProfileFunction from '../functions/updateProfileFunction.js';

describe('update personal account unit test', function () {
  // testing invalid name field
  describe('Validate update profile fields test', function () {
    it('Result should be invalid name format', function () {
      const result =  updateProfileFunction.validateUpdateProfileFields("testname1", "test@gmail.com", "Testoldpassword1", "TestnewPassword1");
      expect(result).to.equal('Invalid name format!');
    });
  });

  // testing invalid email field
  describe('Validate update profile fields test', function () {
    it('Result should be invalid email format', function () {
      const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@", "Testoldpassword1", "TestnewPassword1");
      expect(result).to.equal('Invalid email format!');
    });
  });

  // testing invalid old password field
  describe('Validate update profile fields test', function () {
    it('Result should be invalid old password format', function () {
      const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@gmail.com", "testoldpassword", "TestnewPassword1");
      expect(result).to.equal('Invalid oldpassword format!');
    });
  });

  // testing invalid new password fields
  describe('Validate update profile fields test', function () {
    it('Result should be invalid new password format', function () {
      const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@gmail.com", "Testoldpassword1", "TestnewPassword");
      expect(result).to.equal('Invalid newPassword format!');
    });
  });

  // testing valid update fields
  describe('Validate update profile fields test', function () {
    it('Result should be valid', function () {
      const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@gmail.com", "Testoldpassword1", "TestnewPassword1");
      expect(result).to.equal('valid');
    });
  });

    // testing empty field
    describe('Validate update profile fields test', function () {
        it('Result should be not be valid', function () {
            const result =  updateProfileFunction.validateUpdateProfileFields("", "test@gmail.com", "Testoldpassword1", "TestnewPassword1");
            expect(result).to.not.equal('valid');
        });
    });

    // testing empty field
    describe('Validate update profile fields test', function () {
        it('Result should be not be valid', function () {
            const result =  updateProfileFunction.validateUpdateProfileFields("testname", "", "Testoldpassword1", "TestnewPassword1");
            expect(result).to.not.equal('valid');
        });
    });

    // testing empty field
    describe('Validate update profile fields test', function () {
        it('Result should be not be valid', function () {
            const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@gmail.com", "", "TestnewPassword1");
            expect(result).to.not.equal('valid');
        });
    });

    // testing empty field
    describe('Validate update profile fields test', function () {
        it('Result should be not be valid', function () {
            const result =  updateProfileFunction.validateUpdateProfileFields("testname", "test@gmail.com", "Testoldpassword1", "");
            expect(result).to.not.equal('valid');
        });
    });
});