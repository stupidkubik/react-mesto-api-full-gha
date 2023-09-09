const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { LoginUser } = require('../controllers/users');
const { REGEX_EMAIL } = require('../utils/regex');

router.post('/', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(REGEX_EMAIL),
    password: Joi.string().required().min(2),
  }),
}), LoginUser);

module.exports = router;
