const mongoDBConnection = require('../mongoDBConnection');
const prepare = require('mocha-prepare');
const mms = require('mongodb-memory-server').MongoMemoryServer;

let mongodb;

async function dbInit () {
  mongodb = await mms.create({ instance: { port: 27017, dbName: 'Lantern' } });
  const uri = mongodb.getUri();

  // Set db env variable to in-memory server
  process.env.DB_URI = uri;
}

// Initialize database before any unit tests
prepare((done) => {
  dbInit().then(() => {
    mongoDBConnection.connect(() => { done(); });
  });
});
