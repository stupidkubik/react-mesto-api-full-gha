const rateLimit = require('express-rate-limit');
const { config } = require('../src/config');

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // за 15 минут
  max: config.rateLimit.max, // можно совершить максимум 100 запросов с одного IP
});

module.exports = limiter;
