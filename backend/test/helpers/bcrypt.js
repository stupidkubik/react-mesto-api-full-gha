const Module = require('node:module');

// Test-only hook to stub the native bcrypt binding before app modules load.
// eslint-disable-next-line no-underscore-dangle
const originalLoad = Module._load;
let installed = false;

function installBcryptMock() {
  if (installed) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'bcrypt') {
      return {
        hash: async () => 'stubbed-hash',
        compare: async () => true,
      };
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  installed = true;
}

function uninstallBcryptMock() {
  if (!installed) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  Module._load = originalLoad;
  installed = false;
}

module.exports = {
  installBcryptMock,
  uninstallBcryptMock,
};
