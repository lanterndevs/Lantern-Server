const plaid = require('../plaidConnection');

/*
GET /accounts

ReqBody: {}

Response: Array of accounts
*/

module.exports.getAccounts = async (req, res) => {
  // Get accounts from plaid
  const accounts = [];
  for (let i = 0; i < req.user.items.length; i++) {
    const accountsRequest = {
      access_token: req.user.items[i].accessToken
    };
    try {
      const response = await plaid.client.accountsGet(accountsRequest);
      const plaidAccounts = response.data.accounts;
      for (let j = 0; j < plaidAccounts.length; j++) {
        const balance = (plaidAccounts[j].balances.current !== null) ? plaidAccounts[j].balances.current : plaidAccounts[j].balances.available;
        accounts.push({
          balance: balance,
          description: (plaidAccounts[j].official_name !== null) ? plaidAccounts[j].official_name : '',
          id: plaidAccounts[j].account_id,
          institution: req.user.items[i].institution,
          name: plaidAccounts[j].name
        });
      }
    } catch (error) {
      // handle error
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }

  // Return accounts
  return res.status(200).json(accounts);
};
