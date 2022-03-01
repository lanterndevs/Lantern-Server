const router = require('express').Router();
const transactionsController = require('./transactionsController');
const { authenticateToken } = require('../helpers/jwt');
const { getPlaidItems } = require('../helpers/items');

router.get('/transactions', authenticateToken, getPlaidItems, transactionsController.getTransactions);

module.exports = router;
