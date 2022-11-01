import request from 'request';
import chai from 'chai';
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
          console.log("body is: ", response)
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email format!'
          );
        }
      );
      done();
    });
  });

});
