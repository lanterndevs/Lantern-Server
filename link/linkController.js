const mongoDBConnection = require('../mongoDBConnection');
const plaid = require('../plaidConnection');

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
  let publicToken = req.body.token;
  const request = {
    public_token: publicToken
  };
  try {
    const response = await plaid.client.itemPublicTokenExchange(request);
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    // TODO Store item in database?
    res.status(200).json({ token: accessToken });
  } catch (error) {
    // handle error
    console.log(error)
  }
};
