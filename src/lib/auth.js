const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-secret';
const EXPIRES = '6h';

function sign(payload) {
  return jwt.sign(payload, SECRET, {expiresIn: EXPIRES});
}

function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch(e) { return null; }
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || req.query.token;
  if (!auth) return res.status(401).json({error:'missing token'});
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({error:'invalid token'});
  req.user = payload;
  next();
}

module.exports = {sign, verifyToken, authMiddleware};
