// Control order of test execution
require('dotenv').config();
require('./authTests');
require('./usersTest');
require('./linkTest');
require('./accountsTest');
require('./transactionsTest');
