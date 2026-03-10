const cors = require('cors');
const { config } = require('../src/config');

module.exports = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.cors.allowlist.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
});
