const express = require('express');
const mongoose = require('mongoose');

const { errors } = require('celebrate');
const error = require('./middlewares/error');
const { config } = require('./src/config');
const { applyErrorMiddlewares, applyMiddlewares } = require('./src/transport/apply-middlewares');
const { registerRoutes } = require('./src/transport/register-routes');

function createApp() {
  const app = express();

  applyMiddlewares(app);
  registerRoutes(app);
  applyErrorMiddlewares(app, errors, error);

  return app;
}

async function connectToDatabase(dbUrl = config.database.url) {
  if (mongoose.connection.readyState !== 0) {
    return mongoose.connection;
  }

  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
  });

  return mongoose.connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}

async function startServer({
  port = config.server.port,
  dbUrl = config.database.url,
} = {}) {
  await connectToDatabase(dbUrl);

  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve({
        app,
        server,
        port: server.address().port,
      });
    });

    server.on('error', reject);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    process.stderr.write(`${err.stack || err}\n`);
    process.exit(1);
  });
}

module.exports = {
  createApp,
  connectToDatabase,
  disconnectDatabase,
  startServer,
};
