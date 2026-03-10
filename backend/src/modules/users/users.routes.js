const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { REGEX_URL } = require('../../../utils/regex');
const {
  getUsers,
  getSelf,
  getUserById,
  updateUserById,
  updateUserAvatarById,
} = require('../../../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getSelf);

router.get('/users/:userID', celebrate({
  params: Joi.object().keys({
    userID: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserById);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(REGEX_URL),
  }),
}), updateUserAvatarById);

module.exports = router;
