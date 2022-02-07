const mongoDBConnection = require('../mongoDBConnection');
const { generateAccessToken, authenticateToken } = require('../helpers/jwt');
const { hashPass, isValidPass } = require('../helpers/passwords');
const { ObjectId } = require('mongodb');

/*
POST /register

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
{_id, token}
*/
module.exports.register = (req, res, next) => {
  // Validate unique email
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.body.auth.email }).toArray(async (e, docs) => {
    if (docs.length !== 0) {
      return res.status(400).json({message: 'Email already in use'});
    } else {
      // Encrypt user password
      req.body.auth.password = await hashPass(req.body.auth.password);
      // Insert document
      mongoDBConnection.get().collection('LanternUsers').insertOne(req.body, (e, dbRes) => {
        if (e) {
          return res.status(500).json({message: 'Database Insertion Error'});
        } else {
          const jwtToken = generateAccessToken({email: req.body.auth.email});
          return res.status(201).json({
            _id: dbRes.insertedId.toString(),
            token: jwtToken
          });
        }
      });
    }
  });
};

/*
POST /authenticate

ReqBody:
{
  "email": "string",
  "password": "string"
}

Response:
{_id, token}
*/
module.exports.authenticate = (req, res, next) => {
  // Validate login information
  let email = req.body.email;
  let password = req.body.password;
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': email }).toArray(async (e, docs) => {
    if (docs.length === 0) {
      return res.status(400).json({message: 'Could not find user with provided email!'});
    } else {
      // Validate password
      if (await isValidPass(docs[0].auth.password, password)) {
        // Create new token and return it
        const jwtToken = generateAccessToken({email: email});
        return res.status(201).json({
          _id: docs[0]._id.toString(),
          token: jwtToken
        });
      } else {
        return res.status(403).json({message: 'Invalid email/password combination!'});
      }
    }
  });
};

/*
POST \update

ReqBody:
{
  "first": "string",
  "last": "string",
  "orgName": "string"
}

Response:
{message: "string"}
*/
module.exports.updateUserProfile = (req, res) => {
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.user.email }).toArray((e, docs) => {
    if (docs.length == 0) {
      return res.status(400).json({ message: 'Account invalid' });
    } else {
      // Update document
      const modifiedBio = {
        'bio.first': req.body.first,
        'bio.last': req.body.last,
        'bio.orgName': req.body.orgName
      };

      mongoDBConnection.get().collection('LanternUsers').updateOne({ _id: docs[0]._id }, { $set: modifiedBio }, (e, dbRes) => {
        if (e) {
          return res.status(500).json({ message: 'Database Update Error' });
        } else {
          return res.status(200).json({ message: 'Database Updated' });
        }
      });
    }
  });
};
