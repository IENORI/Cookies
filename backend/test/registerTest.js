import request from 'request';
import chai from 'chai';
const expect = chai.expect;

describe('register account unit test', function () {
  // testing register functions
  describe('empty input fields test', function () {
    it("signup should return 'Invalid email format!'", function (done) {
      request.post(
        {
          url: 'http://localhost:5000/api/users/signup',
          form: {
            token: '',
            email: '',
            password: '',
          },
        },
        function (error, response, body) {
          console.log(response.body);
          expect(JSON.parse(response.body).message).to.equal(
            'Invalid email format!'
          );
          done();
        }
      );
    });
  });
});
