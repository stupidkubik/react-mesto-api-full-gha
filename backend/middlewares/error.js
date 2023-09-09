const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = require('http2').constants;

const error = (err, req, res, next) => {
  const { statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR, message } = err;

  res.status(statusCode).send({
    message: statusCode === HTTP_STATUS_INTERNAL_SERVER_ERROR
      ? 'Server Error'
      : message,
  });
  next();
};

module.exports = error;
