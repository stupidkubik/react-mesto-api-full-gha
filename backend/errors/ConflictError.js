const {
  HTTP_STATUS_CONFLICT, // 409
} = require('http2').constants;

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HTTP_STATUS_CONFLICT;
  }
}

module.exports = ConflictError;
