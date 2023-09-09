const {
  HTTP_STATUS_FORBIDDEN, // 403
} = require('http2').constants;

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HTTP_STATUS_FORBIDDEN;
  }
}

module.exports = ForbiddenError;
