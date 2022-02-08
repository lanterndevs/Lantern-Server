const plaid = require('../plaidConnection');
const mongoDBConnection = require("../mongoDBConnection");
const jwt = require("jsonwebtoken");

module.exports.getAccessTokens = (req, res, next) => {
  // Get all of user's access tokens
  mongoDBConnection.get().collection("LanternUsers").find({ 'auth.email': req.user.email }, {accessTokens: 1}).toArray((e, docs) => {
    if (e) {
      res.status(403).json({ message: "No valid Items (with access tokens) found for user!" });
    } else {
      req.user.accessTokens = docs;
      next();
    }
  });
}

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
    //const itemId = response.data.item_id
    // Store full item and accessTokens in database
    let item = await plaid.getItem(accessToken);
    mongoDBConnection.get().collection('LanternUsers').updateOne({ 'auth.email': req.user.email }, { $push: {items: item, accessTokens: accessToken} }, (e, dbRes) => {
      if (e) {
        res.status(500).json({ message: 'Database insert Item Error!' });
      } else {
        res.status(200).json({ token: accessToken });
      }
    });
  } catch (error) {
    // handle error
    console.log(error);
    res.status(500).json({ message: error });
  }
};
