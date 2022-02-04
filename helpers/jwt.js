const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return (jwt.sign(username, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }));
}
  
// authentication header: "bearer <token>"
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authentication'];
    const token = authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = {
    generateAccessToken,
    authenticateToken
};