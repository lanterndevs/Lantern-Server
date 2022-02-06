var router = require('express').Router();
const usersController = require('./usersController');
const {authenticateToken} = require('../helpers/jwt');

router.post('/users/register', usersController.register)
router.post('/users/update', authenticateToken,  usersController.updateUserProfile)

module.exports = router