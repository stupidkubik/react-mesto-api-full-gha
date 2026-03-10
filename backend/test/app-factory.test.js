const test = require('node:test');
const assert = require('node:assert/strict');
const { installBcryptMock, uninstallBcryptMock } = require('./helpers/bcrypt');

installBcryptMock();

const { closeServer, startHttpOnlyServer } = require('./helpers/server');

test('http-only test harness can boot the app without manual process startup', async () => {
  const { server, baseUrl } = await startHttpOnlyServer();

  try {
    const response = await fetch(`${baseUrl}/users`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { message: 'Problem with authorization' });
  } finally {
    await closeServer(server);
  }
});

test.after(() => {
  uninstallBcryptMock();
});
