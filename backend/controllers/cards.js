const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = require('http2').constants;

const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const cardModel = require('../models/card');
const { normalizePersistenceError } = require('../src/shared/errors');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  return cardModel
    .create({ name, link, owner: req.user._id })
    .then((card) => cardModel.findById(card._id)
      .populate('owner')
      .orFail()
      .then((newCard) => res.status(HTTP_STATUS_CREATED).send(newCard)))
    .catch((err) => next(normalizePersistenceError(err, {
      notFoundMessage: 'Card not found',
    })));
};

const getCards = (req, res, next) => cardModel.find({})
  .populate(['owner', 'likes'])
  .then((data) => res.status(HTTP_STATUS_OK).send(data))
  .catch(next);

const deleteCardById = (req, res, next) => cardModel
  .findById(req.params.cardId)
  .then((card) => {
    if (!card) throw new NotFoundError('Card not found');
    if (!card.owner.equals(req.user._id)) throw new ForbiddenError('Invalid user');

    return cardModel.deleteOne(card)
      .orFail()
      .then(() => res.status(HTTP_STATUS_OK).send({ message: 'Card is deleted' }))
      .catch((err) => next(normalizePersistenceError(err, {
        castMessage: 'Invalid card ID',
        notFoundMessage: 'Card not found',
      })));
  })
  .catch((err) => next(normalizePersistenceError(err, {
    castMessage: 'Invalid card ID',
    notFoundMessage: 'Card not found',
  })));

const putLikeById = (req, res, next) => cardModel
  .findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
  .orFail()
  .populate(['owner', 'likes'])
  .then((card) => res.status(HTTP_STATUS_OK).send(card))
  .catch((err) => next(normalizePersistenceError(err, {
    notFoundMessage: 'Card not found',
  })));

const deleteLikeById = (req, res, next) => cardModel
  .findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
  .orFail()
  .populate(['owner', 'likes'])
  .then((card) => res.status(HTTP_STATUS_OK).send(card))
  .catch((err) => next(normalizePersistenceError(err, {
    notFoundMessage: 'Card not found',
  })));

module.exports = {
  createCard,
  getCards,
  deleteCardById,
  putLikeById,
  deleteLikeById,
};
