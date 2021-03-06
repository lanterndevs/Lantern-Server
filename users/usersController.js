const mongoDBConnection = require('../mongoDBConnection');
const { generateAccessToken } = require('../helpers/jwt');
const { hashPass, isValidPass } = require('../helpers/passwords');
const { check, validationResult } = require('express-validator');
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
module.exports.register = [
  // Perform input validation
  check('bio.first').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  check('bio.last').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
    .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
  check('bio.orgName').isLength({ min: 1 }).trim().withMessage('Organization name must be specified.')
    .isAlphanumeric().withMessage('Organization name has non-alphanumeric characters.'),
  check('auth.email').isLength({ min: 1 }).trim().withMessage('Email must be specified.')
    .isEmail().withMessage('Email must be a valid email address.'),
  check('auth.password').isLength({ min: 6 }).trim().withMessage('Password must be 6 characters or greater.'),
  (req, res, next) => {
  // Validate unique email
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Display sanitized values/errors messages.
      return res.status(400).json({ message: errors.array()[0].msg });
    } else {
      mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.body.auth.email }).toArray(async (e, docs) => {
        if (docs.length !== 0) {
          return res.status(400).json({ message: 'Email already in use' });
        } else {
          // Encrypt user password
          req.body.auth.password = await hashPass(req.body.auth.password);
          // Insert document
          mongoDBConnection.get().collection('LanternUsers').insertOne(req.body, (e, dbRes) => {
            if (e) {
              return res.status(500).json({ message: 'Database Insertion Error' });
            } else {
              const jwtToken = generateAccessToken({ email: req.body.auth.email });
              return res.status(201).json({
                _id: dbRes.insertedId.toString(),
                token: jwtToken
              });
            }
          });
        }
      });
    }
  }
];
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
  const email = req.body.email;
  const password = req.body.password;
  mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': email }).toArray(async (e, docs) => {
    if (docs.length === 0) {
      return res.status(401).json({ message: 'Could not find user with provided email!' });
    } else {
      // Validate password
      if (await isValidPass(docs[0].auth.password, password)) {
        // Create new token and return it
        const jwtToken = generateAccessToken({ email: email });
        return res.status(200).json({
          _id: docs[0]._id.toString(),
          token: jwtToken
        });
      } else {
        return res.status(401).json({ message: 'Invalid email/password combination!' });
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
module.exports.updateUserProfile = [
  check('req.first').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  check('last').isLength({ min: 1 }).trim().withMessage('Last name must be specified.')
    .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
  check('orgName').isLength({ min: 1 }).trim().withMessage('Organization name must be specified.')
    .isAlphanumeric().withMessage('Organization name has non-alphanumeric characters.'),
  (req, res) => {
    mongoDBConnection.get().collection('LanternUsers').find({ 'auth.email': req.user.email }).toArray((e, docs) => {
      if (docs.length === 0) {
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
  }];
