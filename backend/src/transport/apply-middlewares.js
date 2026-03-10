const express = require('express');
const helmet = require('helmet');

const cors = require('../../middlewares/cors');
const limiter = require('../../middlewares/limiter');
const { requestLogger, errorLogger } = require('../../middlewares/logger');

function applyMiddlewares(app) {
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(limiter);
}

function applyErrorMiddlewares(app, celebrateErrors, errorMiddleware) {
  app.use(errorLogger);
  app.use(celebrateErrors());
  app.use(errorMiddleware);
}

module.exports = {
  applyErrorMiddlewares,
  applyMiddlewares,
};
