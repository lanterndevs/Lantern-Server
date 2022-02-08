const { hashPass, isValidPass } = require('../helpers/passwords');

const origPassword = 'test_password';
let hashedPassword;

// Test password hashing / checking
describe('Check password hashing/verification', () => {
  it('It should hash a password', (done) => {
    hashPass(origPassword).then((result) => {
      hashedPassword = result;
      hashedPassword.hash.should.not.equal(origPassword);
      done();
    });
  });
  it('It should verify a correct password', (done) => {
    isValidPass(hashedPassword, origPassword).then((result) => {
      const passCorrect = result;
      passCorrect.should.equal(true);
      done();
    });
  });
  it('It should NOT verify an incorrect password', (done) => {
    isValidPass(hashedPassword, 'incorrectPassword').then((result) => {
      const passCorrect = result;
      passCorrect.should.equal(false);
      done();
    });
  });
});
