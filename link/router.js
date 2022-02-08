const router = require('express').Router();
const linkController = require('./linkController');

router.get('/link', linkController.create);
router.post('/link', linkController.exchange);

module.exports = router;
