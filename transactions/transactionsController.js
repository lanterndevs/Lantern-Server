const plaid = require('../plaidConnection');
let dateHelper = require('../helpers/dates');
const {copyDate, addYears, getFormattedDate} = require("../helpers/dates");

/*
GET /transactions

ReqBody: {}

Response: Array of transactions
*/

module.exports.getTransactions = async (req, res) => {
    // Get transactions from plaid
    const transactions = [];
    let today = new Date();
    let start = addYears(copyDate(today), -2);
    let todayString = getFormattedDate(today);
    let startString = getFormattedDate(start);
    for (let i = 0; i < req.user.items.length; i++) {
        const transactionsRequest = {
            access_token: req.user.items[i].accessToken,
            start_date: startString,
            end_date: todayString
        };
        try {
            const response = await plaid.client.transactionsGet(transactionsRequest);
            let plaidTransactions = response.data.transactions;
            const total_transactions = response.data.total_transactions;
            // Manipulate the offset parameter to paginate
            // transactions and retrieve all available data
            while (plaidTransactions.length < total_transactions) {
                const paginatedRequest = {
                    access_token: req.user.items[i].accessToken,
                    start_date: startString,
                    end_date: todayString,
                    options: {
                        offset: plaidTransactions.length,
                    },
                };
                const paginatedResponse = await plaid.client.transactionsGet(paginatedRequest);
                plaidTransactions = plaidTransactions.concat(
                    paginatedResponse.data.transactions,
                );
            }
            for (let j = 0; j < plaidTransactions.length; j++) {
                transactions.push({
                    accountID: plaidTransactions[j].account_id,
                    amount: plaidTransactions[j].amount,
                    date: plaidTransactions[j].date,
                    categories: plaidTransactions[j].category,
                    details: plaidTransactions[j].location.city + ", " + plaidTransactions[j].location.state + " - " + plaidTransactions[j].payment_channel.toUpperCase(),
                    name: plaidTransactions[j].name
                });
            }
        } catch (err) {
            // handle error
            console.log(err);
        }
    }

    // Return transactions
    res.status(200).json(transactions);
};
