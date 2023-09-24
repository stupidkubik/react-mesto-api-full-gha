const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

require('dotenv').config();

const { JWT_SECRET, NODE_ENV } = process.env;
const DEV_KEY = 'string';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Bad token');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : DEV_KEY);
    console.log(payload);
  } catch (err) {
    throw new UnauthorizedError('Bad token');
  }
  req.user = payload;
  next();
};
