const router = require('express').Router();
const linkController = require('./linkController');

router.get('/link', linkController.create);

module.exports = router;
