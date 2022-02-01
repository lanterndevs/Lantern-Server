require('dotenv').config();
const mongoDBConnection = require('./mongoDBConnection');
const Express = require('express');
const BodyParser = require('body-parser');
const port = 3000;

const usersRouter = require('./users/router');

const server = Express();
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));

server.get('/', (req, res) => {
  res.status(200);
  res.send({ message: 'Hello World' });
});

server.use('/api/', usersRouter);

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
