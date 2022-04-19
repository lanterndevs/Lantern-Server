require('dotenv').config();
const mongoDBConnection = require('./mongoDBConnection');
const mms = require('mongodb-memory-server').MongoMemoryServer;
const Express = require('express');
const BodyParser = require('body-parser');
const OpenApiValidator = require('express-openapi-validator');
const port = process.env.SERVER_PORT;

const usersRouter = require('./users/router');
const linkRouter = require('./link/router');
const cors = require('cors');

const accountsRouter = require('./accounts/router');
const transactionsRouter = require('./transactions/router');

const server = Express();

if (process.argv.length > 2 && process.argv[2] == 'perf-test') {
  process.env.NODE_ENV = process.argv[2];
}

// set up rate limiter: maximum of five requests per minute
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100
});

// apply rate limiter to all requests
if (process.env.NODE_ENV == 'dev') {
  server.use(limiter);
}

server.use(cors());
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(
  OpenApiValidator.middleware({
    apiSpec: './lantern.yaml',
    validateRequests: true, // (default)
    validateResponses: false // false by default
  })
);
server.use((err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

server.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
    res.status(200);
});

server.use('/api/', usersRouter);
server.use('/api/', linkRouter);
server.use('/api/', accountsRouter);
server.use('/api/', transactionsRouter);


// Bypass connections if running tests
if (process.env.NODE_ENV == 'dev') {
  mongoDBConnection.connect(() => {
    server.listen(port, async () => {
      try {
        console.log('Connected to MongoDB Lantern database');
        console.log('Server listening on port ' + port);
      } catch (e) {
        console.log(e);
      }
    });
  });
}

if (process.env.NODE_ENV == 'perf-test') {
  let mongodb;
  async function dbInit () {
    mongodb = await mms.create({ instance: { port: 27017, dbName: 'Lantern' } });
    const uri = mongodb.getUri();

    // Set db env variable to in-memory server
    process.env.DB_URI = uri;
  }
  dbInit().then(() => {
    mongoDBConnection.connect(() => {});
    server.listen(port);
  });
}



module.exports = server;
