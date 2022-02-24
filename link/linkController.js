const plaid = require('../plaidConnection');
const mongoDBConnection = require('../mongoDBConnection');

/*
GET /create

ReqBody: {}

Response: PlaidLinkToken
*/

module.exports.create = async (req, res) => {
  // Request link token from Plaid
  const request = {
    user: {
      client_user_id: process.env.PLAID_CLIENT_ID
    },
    client_name: process.env.PLAID_APP_NAME,
    products: [plaid.Products.Transactions, plaid.Products.Auth],
    country_codes: [plaid.CountryCode.Us],
    language: 'en'
  };
  try {
    const response = await plaid.client.linkTokenCreate(request);
    const linkToken = response.data.link_token;
    res.status(200).json({ token: linkToken });
  } catch (error) {
    // handle error
    console.log(error);
    res.status(500).json({ message: error });
  }
};

module.exports.exchange = async (req, res) => {
  // Exchange public token for access token
  const exchangeRequest = {
    public_token: req.body.token
  };
  try {
    const response = await plaid.client.itemPublicTokenExchange(exchangeRequest);
    const accessToken = response.data.access_token;
    // const itemId = response.data.item_id
    // Store full item and accessTokens in database
    const item = await plaid.getItem(accessToken);
    item.accessToken = accessToken;
    // If item with same institution already exists, replace it
    mongoDBConnection.get().collection('LanternUsers').find({'auth.email': req.user.email}).toArray((e, docs) => {
      if (docs[0].items && docs[0].items.length > 0) {
        for (let i = 0; i < docs[0].items.length; i++) {
          if (docs[0].items[i].institution_id === item.institution_id) {
            // Replace item in user's item array
            docs[0].items[i] = item;
            mongoDBConnection.get().collection('LanternUsers').updateOne({'auth.email': req.user.email}, { $set: {items: docs[0].items} }, (e, dbRes) => {
              if (e) {
                res.status(500).json({ message: 'Database insert Item Error!' });
              } else {
                res.status(200).json({ token: accessToken });
              }
            });
          }
        }
      }
      // No matching item found - push item to database
      mongoDBConnection.get().collection('LanternUsers').updateOne({ 'auth.email': req.user.email }, { $push: { items: item } }, (e, dbRes) => {
        if (e) {
          res.status(500).json({ message: 'Database insert Item Error!' });
        } else {
          res.status(200).json({ token: accessToken });
        }
      });
    });

  } catch (error) {
    // handle error
    console.log(error);
    res.status(500).json({ message: error });
  }
};
