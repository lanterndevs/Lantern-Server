const mongoDBConnection = require('../mongoDBConnection');
const {generateAccessToken, authenticateToken} = require('../helpers/jwt');
const {ObjectId} = require('mongodb');

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
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.body.auth.email }).toArray((e, docs) => {
    if (docs.length !== 0) {
      return res.status(400).json({ message: 'Email already in use' });
    } else {
      // Insert document
      mongoDBConnection.get().collection('LanternUsers').insertOne(req.body, (e, dbRes) => {
        if (e) {
          return res.status(500).json({message:"Database Insertion Error"});
        } else {
          const jwtToken = generateAccessToken({email:req.body.auth.email});
          return res.status(201).json({_id: dbRes.insertedId, token: jwtToken});
        }
      });
    }
  });
}


/*
POST \update

ReqBody: 
{
  "bio": {
    "first": "string",
    "last": "string",
    "orgName": "string"
  }
}

Response:
{message: "string"}
*/
module.exports.updateUserProfile = (req, res) => {
  mongoDBConnection.get().collection('LanternUsers').find({"auth.email":req.user.email}).toArray((e,docs) => {
    if (docs.length == 0) {
      return res.status(400).json({message:"Account invalid"});
    } else {
      // Update document
      const modifiedBio = {
        "bio.first": req.body.bio.first,
        "bio.last": req.body.bio.last,
        "bio.orgName": req.body.bio.orgName
      }

      mongoDBConnection.get().collection('LanternUsers').updateOne({_id: docs[0]._id}, {$set:modifiedBio}, (e, dbRes) => {
        if (e) {
          return res.status(500).json({message:"Database Update Error"});
        } else {
          return res.status(200).json({message:"Database Updated"});
        }
      });
    }
  });
}