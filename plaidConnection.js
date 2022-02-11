const Configuration = require('plaid').Configuration;
const PlaidApi = require('plaid').PlaidApi;
const PlaidEnvironments = require('plaid').PlaidEnvironments;
const Products = require('plaid').Products;
const CountryCode = require('plaid').CountryCode;

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET
    }
  }
});

const client = new PlaidApi(configuration);

function getItem (accessToken) {
  return new Promise((resolve, reject) => {
    // Fetch Plaid Item
    const request = {
      access_token: accessToken
    };
    try {
      client.itemGet(request).then((response) => {
        const item = response.data.item;
        // const status = response.data.status;
        resolve(item);
      });
    } catch (error) {
      // handle error
      reject(error);
    }
  });
}

module.exports = {
  client,
  getItem,
  Products,
  CountryCode
};
