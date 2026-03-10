const { config } = require('../config');
const { createRouter } = require('./create-router');

function registerRoutes(app) {
  if (!config.env.isProduction) {
    app.get('/crash-test', () => {
      setTimeout(() => {
        throw new Error('Сервер сейчас упадёт');
      }, 0);
    });
  }

  app.use(createRouter());
}

module.exports = {
  registerRoutes,
};
