const mongoDBConnection = require('../mongoDBConnection')

/*
POST \register

ReqBody:
{
  "auth": {
    "email": "string",
    "password": "string"
  },
  "bio": {
    "first": "string",
    "last": "string",
    "orgName": "string"
  }
}

Response:
[_id string]
*/

module.exports.register = (req, res) => {
  // Validate unique email
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.body.auth.email }).toArray((e, docs) => {
    if (docs.length != 0) {
      return res.status(400).json({ message: 'Email already in use' })
    } else {
      // Insert document
      mongoDBConnection.get().collection('LanternUsers').insertOne(req.body, (e, dbRes) => {
        if (e) {
          return res.status(500).json({ message: 'Database Insertion Error' })
        } else {
          return res.status(201).json({ _id: dbRes.insertedId, message: 'Welcome ' + req.body.bio.first })
        }
      })
    }
  })
}
