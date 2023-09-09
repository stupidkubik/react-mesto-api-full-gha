const mongoose = require('mongoose');
const { REGEX_URL } = require('../utils/regex');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название не может быть пустым'],
    minlength: [2, 'Минимальная длина — 2 буквы'],
    maxlength: [30, 'Максимальная длина — 30 букв'],
  },
  link: {
    type: String,
    required: [true, 'Ссылка не может быть пустой'],
    validate: {
      validator(str) {
        return REGEX_URL.test(str);
      },
      message: 'Введите URL',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model('card', cardSchema);
