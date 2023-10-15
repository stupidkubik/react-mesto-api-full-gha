const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const UnauthorizedError = require('../errors/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Имя должно быть не меньше двух букв'],
    maxlength: [30, 'Имя должно быть короче 30 букв'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Описание должно быть длинее двух букв'],
    maxlength: [30, 'Описание должно быть короче 30 букв'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(str) {
        return validator.isURL(str);
      },
      message: 'Введите существующий URL',
    },
  },
  email: {
    type: String,
    required: [true, 'Обязательное поле'],
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Введите email',
    },
  },
  password: {
    type: String,
    required: [true, 'Введите пароль'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Wrong email or password');
      }

      return bcrypt.compare(password, user.password)
        .then((isValid) => {
          if (!isValid) {
            throw new UnauthorizedError('Wrong email or password');
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
