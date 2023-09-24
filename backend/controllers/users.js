const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { SALT_ROUNDS = 10, JWT_SECRET, NODE_ENV } = process.env;
const DEV_KEY = 'string';

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = require('http2').constants;

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const userModel = require('../models/user');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) throw new BadRequestError('Email и password не могут быть пустыми');

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => userModel.create({
      name, about, avatar, email, password: hash,
    })
      .then((newUser) => res.status(HTTP_STATUS_CREATED).send({
        name: newUser.name,
        about: newUser.about,
        email: newUser.email,
        avatar: newUser.avatar,
      }))
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError(`${email} already exist`));
        }
        if (err instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(err.message));
        }
        next(err);
      }));
};

const LoginUser = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new BadRequestError('Email и password не могут быть пустыми');

  userModel.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : DEV_KEY,
        { expiresIn: '7d' },
      );
      res.status(HTTP_STATUS_OK).send({ token });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

const getSelf = (req, res, next) => userModel.findById(req.user._id)
  .then((data) => res.status(HTTP_STATUS_OK).send(data))
  .catch(next);

const getUsers = (req, res, next) => userModel.find({})
  .then((data) => res.status(HTTP_STATUS_OK).send(data))
  .catch(next);

const getUserById = (req, res, next) => userModel
  .findById(req.params.userID)
  .then((data) => {
    if (!data) throw new NotFoundError('User not found');
    return res.status(HTTP_STATUS_OK).send(data);
  })
  .catch(next);

const updateUserById = (req, res, next) => {
  const { name, about } = req.body;

  return userModel
    .findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: 'true', runValidators: true },
    )
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('User not found'));
      }
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};

const updateUserAvatarById = (req, res, next) => userModel
  .findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: 'true', runValidators: true },
  )
  .orFail()
  .then((user) => res.status(HTTP_STATUS_OK).send(user))
  .catch((err) => {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      return next(new NotFoundError('User not found'));
    }
    if (err instanceof mongoose.Error.ValidationError) {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  });

module.exports = {
  createUser,
  LoginUser,
  getUsers,
  getSelf,
  getUserById,
  updateUserById,
  updateUserAvatarById,
};
