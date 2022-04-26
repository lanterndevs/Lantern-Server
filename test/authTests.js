const { hashPass, isValidPass } = require('../helpers/passwords');
const { encryptString, decryptContent } = require('../helpers/aes');

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

// Test AES encryption
describe('Check AES encryption', () => {
  const strToEncrypt = 'thisisastringofsomerandomlength.it can have spaces in the middle, but not the beginning or end!';
  let contentToDecrypt = null;
  it('It should encrypt a string of any length', (done) => {
    encryptString(strToEncrypt).then((encryptedContent) => {
      contentToDecrypt = encryptedContent;
      encryptedContent.should.have.property('encryptedHex');
      encryptedContent.should.have.property('iv');
      encryptedContent.encryptedHex.should.have.length.greaterThan(0);
      done();
    });
  });
  it('It should decrypt a string of any length', (done) => {
    decryptContent(contentToDecrypt).then((decryptedStr) => {
      decryptedStr.should.equal(strToEncrypt);
      done();
    });
  });
});
