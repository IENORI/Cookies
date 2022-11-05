import request from 'request';
import chai from 'chai';
const expect = chai.expect;
import updateProfileFunction from '../functions/updateProfileFunction.js';

describe('update personal account unit test', function () {
  // testing invalid name field
  describe('Invalid old password test', function () {
    it('Result should be invalid oldpassword format', function () {
      const result =  updateProfileFunction.validatePasswordUpdateFields("Testoldpassword", "TestnewPassword1");
      expect(result).to.equal('Invalid oldpassword format!');
    });
  });

  // testing invalid name field
  describe('Invalid new password test', function () {
    it('Result should be invalid newpassword format', function () {
      const result =  updateProfileFunction.validatePasswordUpdateFields("Testoldpassword1", "TestnewPassword");
      expect(result).to.equal('Invalid newPassword format!');
    });
  });

  // testing invalid name field
  describe('Valid passwords test', function () {
    it('Result should be valid', function () {
      const result =  updateProfileFunction.validatePasswordUpdateFields("Testoldpassword1", "TestnewPassword1");
      expect(result).to.equal('valid');
    });
  });

  // testing invalid name field
  describe('Empty password test', function () {
    it('Result should be invalid newpassword format', function () {
      const result =  updateProfileFunction.validatePasswordUpdateFields("", "");
      expect(result).to.equal('Invalid oldpassword format!');
    });
  });

  // testing invalid name field
  describe('Common password test', function () {
    it('Result should be invalid newpassword format', function () {
      const result =  updateProfileFunction.validatePasswordUpdateFields("Testoldpassword1", "rush2112");
      expect(result).to.equal('Common password entered! For security reasons please use another password.');
    });
  });

});