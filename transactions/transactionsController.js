const plaid = require('../plaidConnection');
const { copyDate, addYears, getFormattedDate } = require('../helpers/dates');

/*
GET /transactions

ReqBody: {}

Response: Array of transactions
*/

module.exports.getTransactions = async (req, res) => {
  // Get transactions from plaid
  const transactions = [];
  let startDate;
  let endDate;
  let reqOptions = {};
  const today = new Date();
  // If start date specified
  if (req.query.start_date != null) {
    startDate = req.query.start_date;
  } else {
    startDate = getFormattedDate(addYears(copyDate(today), -2));
  }
  // If end date specified
  if (req.query.end_date != null) {
    endDate = req.query.end_date;
  } else {
    endDate = getFormattedDate(today);
  }
  // If page specified
  if (req.query.offset != null) {
    reqOptions.offset = req.query.offset;
  } else {
    reqOptions.offset = 0;
  }

  for (let i = 0; i < req.user.items.length; i++) {
    const transactionsRequest = {
      access_token: req.user.items[i].accessToken,
      start_date: startDate,
      end_date: endDate,
      options: reqOptions
    };
    try {
      const response = await plaid.client.transactionsGet(transactionsRequest);
      let plaidTransactions = response.data.transactions;
      const totalTransactions = response.data.total_transactions;
      // If offset not specified by request, continue to paginate
      if (req.query.offset == null) {
        while (plaidTransactions.length < totalTransactions) {
          const paginatedRequest = {
            access_token: req.user.items[i].accessToken,
            start_date: startDate,
            end_date: endDate,
            options: {
              offset: plaidTransactions.length
            }
          };
          const paginatedResponse = await plaid.client.transactionsGet(paginatedRequest);
          plaidTransactions = plaidTransactions.concat(
              paginatedResponse.data.transactions
          );
        }
      }
      // Get just what we need
      for (let j = 0; j < plaidTransactions.length; j++) {
        transactions.push({
          accountID: plaidTransactions[j].account_id,
          amount: plaidTransactions[j].amount,
          date: plaidTransactions[j].date,
          categories: plaidTransactions[j].category,
          details: plaidTransactions[j].location.city + ', ' + plaidTransactions[j].location.state + ' - ' + plaidTransactions[j].payment_channel.toUpperCase(),
          name: plaidTransactions[j].name
        });
      }
    } catch (err) {
      // handle error
      console.log(err);
      res.status(500).json({ message: err });
    }
  }

  // Return transactions
  res.status(200).json(transactions);
};
