let aesjs = require('aes-js');

let keyArray = process.env.AES_KEY.split(',');
for (let i = 0; i < keyArray.length; i++) {
    keyArray[i] = parseInt(keyArray[i]);
}

function genRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function genRandIV () {
    let ivArray = new Array(16);
    for (let i = 0; i < ivArray.length; i++) {
        ivArray[i] = genRandomInt(256);
    }
    return ivArray;
}

// Takes an unencrypted string and returns an encryption object
function encryptString (rawInput) {
    let randIV = genRandIV();
    let aesCBC = new aesjs.ModeOfOperation.cbc(keyArray, randIV);
    let rawInputBytes = aesjs.utils.utf8.toBytes(rawInput);
    // Add buffer to make sure rawInputBytes length is multiple of 16
    let bufferedBytes = ;
    rawInputBytes =
    // Must encrypt 16 bytes at a time for CBC mode
    for (let i = 0; i < Math.ceil(rawInputBytes.length / 16))
    let encryptedBytes = aesCBC.encrypt(rawInputBytes);
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return {
        encryptedHex: encryptedHex,
        iv: randIV
    }
}

// Takes an encryption object and returns a decrypted string
function decryptContent (encryptedContent) {
    let aesCBC = new aesjs.ModeOfOperation.cbc(keyArray, encryptedContent.iv);
    let encryptedBytes = aesjs.utils.hex.toBytes(encryptedContent.encryptedHex);
    let decryptedBytes = aesCBC.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

module.exports = {
    encryptString,
    decryptContent
};
