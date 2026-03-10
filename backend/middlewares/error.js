const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = require('http2').constants;
const { getRuntimeErrorMessage } = require('../src/shared/errors');

// Express recognizes error middleware only when it has four arguments.
// eslint-disable-next-line no-unused-vars
const error = (err, req, res, next) => {
  const { statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR } = err;
  const responseMessage = getRuntimeErrorMessage(
    err,
    statusCode,
    'Server Error',
  );

  res.status(statusCode).send({
    message: responseMessage,
  });
};

module.exports = error;
