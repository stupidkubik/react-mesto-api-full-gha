require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const error = require('./middlewares/error');
const limiter = require('./middlewares/limiter');
const router = require('./routes');

const DEFAULT_PORT = 3000;
const DEFAULT_DB_URL = 'mongodb://127.0.0.1:27017/mestodb';

function createApp() {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Сервер сейчас упадёт');
    }, 0);
  });

  app.disable('x-powered-by');
  app.use(helmet());

  app.use(requestLogger);
  app.use(limiter);

  app.use(router);

  app.use(errorLogger);
  app.use(errors());
  app.use(error);

  return app;
}

async function connectToDatabase(dbUrl = process.env.DB_URL || DEFAULT_DB_URL) {
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
  port = process.env.PORT || DEFAULT_PORT,
  dbUrl = process.env.DB_URL || DEFAULT_DB_URL,
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
  DEFAULT_PORT,
  DEFAULT_DB_URL,
  createApp,
  connectToDatabase,
  disconnectDatabase,
  startServer,
};
