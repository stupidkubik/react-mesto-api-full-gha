const test = require('node:test');
const assert = require('node:assert/strict');

const { installBcryptMock, uninstallBcryptMock } = require('./helpers/bcrypt');

installBcryptMock();

const { requestJson } = require('./helpers/http');
const { startIntegrationServer } = require('./helpers/server');

let integration;

const primaryUser = {
  email: 'primary@example.com',
  password: 'secret-1',
  name: 'Primary User',
  about: 'Initial profile',
  avatar: 'https://example.com/primary.png',
};

const secondaryUser = {
  email: 'secondary@example.com',
  password: 'secret-2',
  name: 'Secondary User',
  about: 'Second profile',
  avatar: 'https://example.com/secondary.png',
};

async function signup(user) {
  return requestJson(integration.baseUrl, '/signup', {
    method: 'POST',
    body: user,
  });
}

async function signin({ email, password }) {
  return requestJson(integration.baseUrl, '/signin', {
    method: 'POST',
    body: { email, password },
  });
}

test.before(async () => {
  integration = await startIntegrationServer();
});

test.after(async () => {
  if (integration) {
    await integration.close();
  }
  uninstallBcryptMock();
});

test.beforeEach(async () => {
  await integration.resetDatabase();
});

test('signup returns the current legacy reduced user object', async () => {
  const result = await signup(primaryUser);

  assert.equal(result.status, 201);
  assert.equal(result.body.email, primaryUser.email);
  assert.equal(result.body.name, primaryUser.name);
  assert.equal(result.body.about, primaryUser.about);
  assert.equal(result.body.avatar, primaryUser.avatar);
  assert.equal('_id' in result.body, false);
});

test('signin returns a bearer token after signup', async () => {
  await signup(primaryUser);

  const result = await signin(primaryUser);

  assert.equal(result.status, 200);
  assert.equal(typeof result.body.token, 'string');
  assert.ok(result.body.token.length > 0);
});

test('protected routes reject requests without bearer auth', async () => {
  const result = await requestJson(integration.baseUrl, '/users');

  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { message: 'Problem with authorization' });
});

test('users/me returns the current authenticated user', async () => {
  await signup(primaryUser);
  const login = await signin(primaryUser);

  const result = await requestJson(integration.baseUrl, '/users/me', {
    token: login.body.token,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.email, primaryUser.email);
  assert.ok(result.body._id);
});

test('current user profile and avatar can be updated', async () => {
  await signup(primaryUser);
  const login = await signin(primaryUser);

  const profile = await requestJson(integration.baseUrl, '/users/me', {
    method: 'PATCH',
    token: login.body.token,
    body: {
      name: 'Updated Name',
      about: 'Updated About',
    },
  });

  assert.equal(profile.status, 200);
  assert.equal(profile.body.name, 'Updated Name');
  assert.equal(profile.body.about, 'Updated About');

  const avatar = await requestJson(integration.baseUrl, '/users/me/avatar', {
    method: 'PATCH',
    token: login.body.token,
    body: {
      avatar: 'https://example.com/updated-avatar.png',
    },
  });

  assert.equal(avatar.status, 200);
  assert.equal(avatar.body.avatar, 'https://example.com/updated-avatar.png');
});

test('cards can be created, liked, unliked and deleted by owner', async () => {
  await signup(primaryUser);
  const login = await signin(primaryUser);

  const created = await requestJson(integration.baseUrl, '/cards', {
    method: 'POST',
    token: login.body.token,
    body: {
      name: 'A card',
      link: 'https://example.com/card.png',
    },
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.name, 'A card');
  assert.equal(created.body.owner.email, primaryUser.email);
  assert.deepEqual(created.body.likes, []);

  const liked = await requestJson(integration.baseUrl, `/cards/${created.body._id}/likes`, {
    method: 'PUT',
    token: login.body.token,
  });

  assert.equal(liked.status, 200);
  assert.equal(liked.body.likes.length, 1);
  assert.equal(liked.body.likes[0].email, primaryUser.email);

  const unliked = await requestJson(integration.baseUrl, `/cards/${created.body._id}/likes`, {
    method: 'DELETE',
    token: login.body.token,
  });

  assert.equal(unliked.status, 200);
  assert.deepEqual(unliked.body.likes, []);

  const removed = await requestJson(integration.baseUrl, `/cards/${created.body._id}`, {
    method: 'DELETE',
    token: login.body.token,
  });

  assert.equal(removed.status, 200);
  assert.deepEqual(removed.body, { message: 'Card is deleted' });
});

test('deleting another users card returns forbidden', async () => {
  await signup(primaryUser);
  const firstLogin = await signin(primaryUser);
  await signup(secondaryUser);
  const secondLogin = await signin(secondaryUser);

  const created = await requestJson(integration.baseUrl, '/cards', {
    method: 'POST',
    token: firstLogin.body.token,
    body: {
      name: 'Protected card',
      link: 'https://example.com/protected.png',
    },
  });

  const removed = await requestJson(integration.baseUrl, `/cards/${created.body._id}`, {
    method: 'DELETE',
    token: secondLogin.body.token,
  });

  assert.equal(removed.status, 403);
  assert.deepEqual(removed.body, { message: 'Invalid user' });
});

test('validation and not found errors follow the current runtime envelope', async () => {
  await signup(primaryUser);
  const login = await signin(primaryUser);

  const invalidCard = await requestJson(integration.baseUrl, '/cards', {
    method: 'POST',
    token: login.body.token,
    body: {
      name: 'x',
      link: 'bad-link',
    },
  });

  assert.equal(invalidCard.status, 400);
  assert.equal(typeof invalidCard.body.message, 'string');

  const missingUser = await requestJson(integration.baseUrl, '/users/507f1f77bcf86cd799439011', {
    token: login.body.token,
  });

  assert.equal(missingUser.status, 404);
  assert.deepEqual(missingUser.body, { message: 'User not found' });
});
