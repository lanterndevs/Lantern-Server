const {pbkdf2} = require("crypto");

const keyLen = 64;
const iterations = 10000;
const digest = 'sha256'

function hashPass(pass) {
    return new Promise((resolve, reject) => {
        let salt = crypto.randomBytes(128).toString('base64');
        pbkdf2(pass, salt, iterations, keyLen, digest, (err, key) => {
            if (err) {
                reject(err);
            }

            resolve({
                salt: salt,
                hash: key.toString(),
            });
        });
    });
}

function isValidPass(actualHash, givenPassword) {
    return new Promise((resolve, reject) => {
        pbkdf2(givenPassword, actualHash.salt, iterations, keyLen, digest, (err, hashedGivenPassword) => {
            resolve(actualHash.hash === hashedGivenPassword);
        });
    });
}

module.exports = {
    hashPass,
    isValidPass
};
