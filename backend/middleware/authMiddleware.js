const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  let token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: Invalid token' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Verifica il token
    req.user = verified; // Aggiungi l'utente verificato alla richiesta
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;