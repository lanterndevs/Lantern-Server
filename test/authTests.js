const { chai, server, assert, should } = require('./testConfig');
const { generateAccessToken, authenticateToken } = require('../helpers/jwt');
const { hashPass, isValidPass } = require('../helpers/passwords');

let origPassword = "test_password"
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
        isValidPass(hashedPassword.hash, origPassword).then((result) => {
            let passCorrect = result;
            passCorrect.should.equal(true);
            done();
        });

    });
    it('It should NOT verify an incorrect password', async (done) => {
        isValidPass(hashedPassword.hash, "incorrectPassword").then((result) => {
            let passCorrect = result;
            passCorrect.should.equal(false);
            done();
        });
    });
});
