const router = require('express').Router();
const accountsController = require('./accountsController');
const { authenticateToken } = require('../helpers/jwt');

router.get('/accounts', authenticateToken, accountsController.getAccounts);

module.exports = router;
