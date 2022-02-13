const router = require('express').Router();
const accountsController = require('./accountsController');
const { authenticateToken } = require('../helpers/jwt');
const { getPlaidItems } = require('../helpers/items');

router.get('/accounts', authenticateToken, getPlaidItems, accountsController.getAccounts);

module.exports = router;
