const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const { getJwtSecret } = require('../src/config');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Problem with authorization');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (err) {
    throw new UnauthorizedError('Problem with token');
  }
  req.user = payload;
  next();
};
