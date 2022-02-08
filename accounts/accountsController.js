const plaid = require('../plaidConnection');

/*
GET /accounts

ReqBody: {}

Response: PlaidLinkToken
*/

module.exports.getAccounts = async (req, res) => {
    // Get accounts from plaid
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
