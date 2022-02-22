const mongo = require('../mongoDBConnection');

function getPlaidItems (req, res, next) {
  // Fetch access token(s) and item(s) for user
  mongo.get().collection('LanternUsers').find({ 'auth.email': req.user.email }).toArray((e, docs) => {
    if (e) {
      console.log(e);
      res.status(500).json({ message: e });
    } else {
      if (docs == null || docs.length === 0 || docs[0].items == null || docs[0].items.length === 0) {
        res.status(400).json({ message: 'No valid plaid credentials in account! Please use Plaid Link to generate an access token.' });
      } else {
        req.user.items = docs[0].items;
        next();
      }
    }
  });
}

module.exports = {
  getPlaidItems
};
