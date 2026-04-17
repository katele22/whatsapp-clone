const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "changeme-set-JWT_SECRET-in-env";

// Middleware: verifies the JWT stored in the HTTP-only cookie "token"
// Attaches the decoded payload to req.user on success
function authenticateToken(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = payload; // { username, iat, exp }
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
