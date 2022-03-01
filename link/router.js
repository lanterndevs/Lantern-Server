const router = require('express').Router();
const linkController = require('./linkController');
const { authenticateToken } = require('../helpers/jwt');

router.get('/link', authenticateToken, linkController.create);
router.post('/link', authenticateToken, linkController.exchange);

module.exports = router;
