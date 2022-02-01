const router = require('express').Router();
const usersController = require('./usersController');

router.post('/users/register', usersController.register);

module.exports = router;
