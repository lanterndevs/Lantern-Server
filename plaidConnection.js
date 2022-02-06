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

module.exports = {
  client,
  Products,
  CountryCode
};
