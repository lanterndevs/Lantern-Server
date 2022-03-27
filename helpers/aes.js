const aesjs = require('aes-js');

const keyArray = process.env.AES_KEY.split(',');
for (let i = 0; i < keyArray.length; i++) {
  keyArray[i] = parseInt(keyArray[i]);
}

function genRandomInt (max) {
  return Math.floor(Math.random() * max);
}

function genRandIV () {
  const ivArray = new Array(16);
  for (let i = 0; i < ivArray.length; i++) {
    ivArray[i] = genRandomInt(256);
  }
  return ivArray;
}

// CBC block size
const BLOCK_SIZE = 16;

// Takes an unencrypted string and returns an encryption object
function encryptString (rawString) {
  return new Promise((resolve) => {
    // Initialize AES CBC
    const randIV = genRandIV();
    // eslint-disable-next-line new-cap
    const aesCBC = new aesjs.ModeOfOperation.cbc(keyArray, randIV);

    // Add buffer to make sure input string is multiple of BLOCK_SIZE bytes
    let appendString = '';
    for (let i = 0; i < (BLOCK_SIZE - (rawString.length % BLOCK_SIZE)); i++) {
      appendString = appendString + ' ';
    }
    const bufferedInput = rawString + appendString;

    // Encrypt BLOCK_SIZE bytes at a time
    let encryptedHex = '';
    for (let i = 0; i < bufferedInput.length; i += BLOCK_SIZE) {
      const byteBlock = aesjs.utils.utf8.toBytes(bufferedInput.substring(i, i + BLOCK_SIZE));
      const encryptedBlock = aesCBC.encrypt(byteBlock);
      const encryptedHexBlock = aesjs.utils.hex.fromBytes(encryptedBlock);
      encryptedHex += encryptedHexBlock;
    }

    resolve({
      encryptedHex: encryptedHex,
      iv: randIV
    });
  });
}

// Takes an encryption object and returns a decrypted string
function decryptContent (encryptedContent) {
  return new Promise((resolve) => {
    // Initialize AES CBC
    // eslint-disable-next-line new-cap
    const aesCBC = new aesjs.ModeOfOperation.cbc(keyArray, encryptedContent.iv);

    // Decrypt BLOCK_SIZE bytes at a time (2 * BLOCK_SIZE hex characters)
    let decryptedString = '';
    for (let i = 0; i < encryptedContent.encryptedHex.length; i += (2 * BLOCK_SIZE)) {
      const byteBlock = aesjs.utils.hex.toBytes(encryptedContent.encryptedHex.substring(i, i + (2 * BLOCK_SIZE)));
      const decryptedBytes = aesCBC.decrypt(byteBlock);
      const decryptedBlock = aesjs.utils.utf8.fromBytes(decryptedBytes);
      decryptedString += decryptedBlock;
    }

    // Remove buffer at end
    decryptedString = decryptedString.trim();

    resolve(decryptedString);
  });
}

module.exports = {
  encryptString,
  decryptContent
};
