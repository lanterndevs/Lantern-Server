const mongoClient = require('mongodb').MongoClient

let db
let client

// Connect to db using enviroment variable
function connect (callback) {
  mongoClient.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, _client) => {
    db = _client.db('Lantern')
    client = _client
    callback()
  })
}
function get () {
  return db
}

function close () {
  client.close()
}

module.exports = {
  connect,
  get,
  close
}
