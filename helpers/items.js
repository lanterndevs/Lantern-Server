const mongo = require('../mongoDBConnection');
let {decryptContent} = require('./aes');

function getPlaidItems (req, res, next) {
  // Fetch and decrypt access token(s) and item(s) for user
  mongo.get().collection('LanternUsers').find({ 'auth.email': req.user.email }).toArray(async (e, docs) => {
    if (e) {
      console.log(e);
      res.status(500).json({message: e});
    } else {
      if (docs == null || docs.length === 0 || docs[0].items == null || docs[0].items.length === 0) {
        res.status(400).json({message: 'No valid plaid credentials in account! Please use Plaid Link to generate an access token.'});
      } else {
        req.user.items = docs[0].items;
        // Decrypt access tokens in items
        for (let i = 0; i < req.user.items.length; i++) {
          req.user.items[i].accessToken = await decryptContent({
            encryptedHex: req.user.items[i].accessToken,
            iv: req.user.items[i].accessTokenIV
          });
        }
        next();
      }
    }
  });
}

module.exports = {
  getPlaidItems
};
