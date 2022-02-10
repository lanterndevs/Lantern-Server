const plaid = require('../plaidConnection');

/*
GET /accounts

ReqBody: {}

Response: Array of accounts
*/

module.exports.getAccounts = async (req, res) => {
    // Get accounts from plaid
    let accounts = [];
    for (let i = 0; i < req.user.items.length; i++) {
        const accountsRequest = {
            access_token: req.user.items[i].accessToken
        };
        try {
            const response = await plaid.client.accountsGet(accountsRequest);
            const plaidAccounts = response.data.accounts;
            for (let j = 0; j < plaidAccounts.length; j++) {
                let balance = (plaidAccounts[j].balances.current !== null) ? plaidAccounts[j].balances.current : plaidAccounts[j].balances.available;
                accounts.push({
                    balance: balance,
                    description: (plaidAccounts[j].official_name !== null) ? plaidAccounts[j].official_name : "",
                    id: plaidAccounts[j].account_id,
                    institutionID: req.user.items[i].institution_id,
                    name: plaidAccounts[j].name
                });
            }
        } catch (error) {
            // handle error
            console.log(error);
        }
    }

    // Return accounts
    res.status(200).json(accounts);
};
