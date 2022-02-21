const jwt = require('jsonwebtoken');

function generateAccessToken (username) {
  return (jwt.sign(username, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }));
}

// authentication header: "bearer <token>"
function authenticateToken (req, res, next) {
  const authHeader = req.get('Authorization');
  if (authHeader == null) return res.sendStatus(401);
  let splitHeader = authHeader.split(' ');
  if (splitHeader.length !== 2) return res.sendStatus(401);
  let token = splitHeader[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = {
  generateAccessToken,
  authenticateToken
};
