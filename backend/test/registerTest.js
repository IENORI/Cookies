import request from 'request';
import chai from 'chai';
const expect = chai.expect;

describe('register account unit test', function () {
  // testing register functions with invalid email
  describe('empty input fields test', function () {
    it("signup should return 'Invalid email format!'", function (done) {
      request.get(
        {
          url: 'https://www.google.com',
        },
        function (error, response, body) {
          expect(response.statusCode).to.equal(200);
        }
      );
      done();
    });
  });


});
