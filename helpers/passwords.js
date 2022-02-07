const crypto = require('crypto');
const keyLen = 64;
const iterations = 100;
const digest = 'sha256'

function hashPass(pass) {
    return new Promise((resolve, reject) => {
        let salt = crypto.randomBytes(64).toString('base64');
        crypto.pbkdf2(pass, salt, iterations, keyLen, digest, (err, key) => {
            if (err) {
                reject(err);
            }

            resolve({
                salt: salt,
                hash: key.toString('base64')
            });
        });
    });
}

function isValidPass(actualHash, givenPassword) {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(givenPassword, actualHash.salt, iterations, keyLen, digest, (err, hashedGivenPassword) => {
            if (err) {
                reject(err);
            }

            resolve(actualHash.hash === hashedGivenPassword.toString('base64'));
        });
    });
}

module.exports = {
    hashPass,
    isValidPass
};
