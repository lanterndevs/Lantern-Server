const plaid = require('../plaidConnection');
const mongoDBConnection = require('../mongoDBConnection');
const {encryptString} = require('../helpers/aes');

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
    // Encrypt access token
    let encryptedTokenContent = await encryptString(accessToken);
    // Store full item and encrypted accessToken in database
    const plaidItem = await plaid.getItem(accessToken);
    // Now get more institution details
    const institutionRequest = {
      institution_id: plaidItem.institution_id,
      country_codes: ['US']
    };
    const insResponse = await plaid.client.institutionsGetById(institutionRequest);
    const plaidInstitution = insResponse.data.institution;
    // Construct new item
    const newItem = {
      id: plaidItem.item_id,
      institution: {
        id: plaidInstitution.institution_id,
        name: plaidInstitution.name
      },
      accessToken: encryptedTokenContent.encryptedHex,
      accessTokenIV: encryptedTokenContent.iv,
      webhook: plaidItem.webhook
    };
    // If item with same institution already exists, replace it
    mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.user.email }).toArray((e, docs) => {
      let replaceItem = false;
      if (docs[0].items && docs[0].items.length > 0) {
        for (let i = 0; i < docs[0].items.length; i++) {
          if (docs[0].items[i].institution.id === newItem.institution.id) {
            replaceItem = true;
            // Replace item in user's item array
            docs[0].items[i] = newItem;
            mongoDBConnection.get().collection('LanternUsers').updateOne({ 'auth.email': req.user.email }, { $set: { items: docs[0].items } }, (e, dbRes) => {
              if (e) {
                res.status(500).json({ message: 'Database insert Item Error!' });
              } else {
                res.status(200).end();
              }
            });
          }
        }
      }
      // No matching item found - push item to database
      if (!replaceItem) {
        mongoDBConnection.get().collection('LanternUsers').updateOne({ 'auth.email': req.user.email }, { $push: { items: newItem } }, (e, dbRes) => {
          if (e) {
            res.status(500).json({ message: 'Database insert Item Error!' });
          } else {
            res.status(200).end();
          }
        });
      }
    });
  } catch (error) {
    // handle error
    console.log(error);
    res.status(500).json({ message: error });
  }
};
