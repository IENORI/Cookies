import request from 'request';
import chai from 'chai';
import User from '../models/userModel.js';
const expect = chai.expect;

describe('register account unit test', function () {
  // testing register functions with invalid email
  describe('empty input fields test', function () {
    it("signup should return 'Invalid email format!'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signup',
          form: {
            name: 'testname',
            email: '',
            password: 'testpassword',
          },
        },
        function (error, response, body) {
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email format!'
          );
          done();
        }
      );
    });
  });

  // testing register function with valid email
  describe('empty input fields test', function () {
    it("signup should return 'created account!'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signup',
          form: {
            name: 'testname',
            email: 'testcaseUser@gmail.com',
            password: 'testpassword',
          },
        },
        function (error, response, body) {
          expect(JSON.parse(response.body).hasOwnProperty('_id')).to.equal(
            true
          );
          const id = JSON.parse(response.body)._id;
          const token = JSON.parse(response.body).token;
          request.delete(
            {
              url: `http://localhost:5000/api/users/deleteuser/${id}`,
              headers: { authorization: `Bearer ${token}` },
            },
            function (error, response, body) {
              expect(response.body).to.equal('user deleted');
            }
          );
        }
      );
      done();
    });
  });
});
