const mongoDBConnection = require('../mongoDBConnection');
const prepare = require('mocha-prepare');
const mms = require('mongodb-memory-server').MongoMemoryServer;
const { exec } = require("child_process");

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
}, (done) => {
  // Called after tests are completed
  exec("mongoexport --collection=LanternUsers --db=Lantern --forceTableScan --out=test_db.json --pretty", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      done();
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      done();
    }
    console.log(`stdout: ${stdout}`);
    done();
  });
});
