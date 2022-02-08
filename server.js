require('dotenv').config();
const mongoDBConnection = require('./mongoDBConnection');
const Express = require('express');
const BodyParser = require('body-parser');
const OpenApiValidator = require('express-openapi-validator');
const port = 3000;

const usersRouter = require('./users/router');
const linkRouter = require('./link/router');
const accountsRouter = require('./accounts/router');

const server = Express();
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(
  OpenApiValidator.middleware({
    apiSpec: './lantern.yaml',
    validateRequests: true, // (default)
    validateResponses: true // false by default
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
  res.status(200);
  res.json({ message: 'Hello World' });
});

server.use('/api/', usersRouter);
server.use('/api/', linkRouter);
server.use('/api/', accountsRouter);

// Bypass connections if running tests
if (process.env.NODE_ENV !== 'test') {
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

module.exports = server;
