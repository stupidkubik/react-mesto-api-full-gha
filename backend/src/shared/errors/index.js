const mongoose = require('mongoose');

const BadRequestError = require('../../../errors/BadRequestError');
const ConflictError = require('../../../errors/ConflictError');
const NotFoundError = require('../../../errors/NotFoundError');

function normalizePersistenceError(err, {
  conflictMessage = 'Conflict',
  notFoundMessage = 'Resource not found',
  castMessage,
} = {}) {
  if (err && err.code === 11000) {
    return new ConflictError(conflictMessage);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return new BadRequestError(err.message);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new BadRequestError(castMessage || err.message);
  }

  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    return new NotFoundError(notFoundMessage);
  }

  return err;
}

function getRuntimeErrorMessage(err, statusCode, fallbackMessage) {
  if (statusCode >= 500) {
    return fallbackMessage;
  }

  return err.message;
}

module.exports = {
  getRuntimeErrorMessage,
  normalizePersistenceError,
};
