const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { LoginUser, createUser } = require('../../../controllers/users');
const { REGEX_EMAIL, REGEX_URL } = require('../../../utils/regex');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(REGEX_URL),
    email: Joi.string().required().pattern(REGEX_EMAIL),
    password: Joi.string().required().min(2),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(REGEX_EMAIL),
    password: Joi.string().required().min(2),
  }),
}), LoginUser);

module.exports = router;
