const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

function getAppModule() {
  // Lazy require so tests can install mocks before the backend module graph loads.
  // eslint-disable-next-line global-require
  return require('../../app');
}

function listenApp(app = getAppModule().createApp(), port = 0, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve({
        app,
        server,
        port: server.address().port,
        baseUrl: `http://127.0.0.1:${server.address().port}`,
      });
    });

    server.on('error', reject);
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

async function startHttpOnlyServer() {
  return listenApp();
}

async function startIntegrationServer({
  port = 0,
  host = '127.0.0.1',
} = {}) {
  const mongod = await MongoMemoryServer.create({
    instance: {
      ip: host,
    },
  });
  const dbUrl = mongod.getUri();
  const { startServer, disconnectDatabase } = getAppModule();
  const { app, server, port: actualPort } = await startServer({ port, dbUrl });

  return {
    app,
    server,
    port: actualPort,
    baseUrl: `http://127.0.0.1:${actualPort}`,
    dbUrl,
    async resetDatabase() {
      await mongoose.connection.db.dropDatabase();
    },
    async close() {
      await closeServer(server);
      await disconnectDatabase();
      await mongod.stop();
    },
  };
}

module.exports = {
  closeServer,
  listenApp,
  startHttpOnlyServer,
  startIntegrationServer,
};
