require('dotenv').config();

const DEFAULT_PORT = 3000;
const DEFAULT_DB_URL = 'mongodb://127.0.0.1:27017/mestodb';
const DEFAULT_TEST_DB_URL = 'mongodb://127.0.0.1:27017/mestodb_test';
const DEFAULT_JWT_DEV_SECRET = 'string';
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 100;
const DEFAULT_CORS_ALLOWLIST = [
  'https://stupid.kubik.nomoredomainsrocks.ru',
  'http://localhost:3000',
  'http://localhost:3001',
];

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseAllowlist(value) {
  if (!value) {
    return DEFAULT_CORS_ALLOWLIST;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const config = Object.freeze({
  env: {
    nodeEnv,
    isProduction,
  },
  server: {
    port: process.env.PORT || DEFAULT_PORT,
  },
  database: {
    url: process.env.DB_URL || DEFAULT_DB_URL,
    testUrl: process.env.TEST_DB_URL || DEFAULT_TEST_DB_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    devJwtSecret: DEFAULT_JWT_DEV_SECRET,
    tokenExpiresIn: '7d',
  },
  cors: {
    allowlist: parseAllowlist(process.env.CORS_ALLOWLIST),
  },
  rateLimit: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
    max: toNumber(process.env.RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
  },
});

function getJwtSecret() {
  if (config.env.isProduction) {
    return config.auth.jwtSecret;
  }

  return config.auth.devJwtSecret;
}

module.exports = {
  DEFAULT_CORS_ALLOWLIST,
  DEFAULT_DB_URL,
  DEFAULT_JWT_DEV_SECRET,
  DEFAULT_PORT,
  DEFAULT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  DEFAULT_TEST_DB_URL,
  config,
  getJwtSecret,
};
