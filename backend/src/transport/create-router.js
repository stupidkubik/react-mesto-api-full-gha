const express = require('express');

const auth = require('../../middlewares/auth');
const NotFoundError = require('../../errors/NotFoundError');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const cardsRoutes = require('../modules/cards/cards.routes');

function createRouter() {
  const appRouter = express.Router();

  appRouter.use(authRoutes);
  appRouter.use(auth);
  appRouter.use(usersRoutes);
  appRouter.use(cardsRoutes);
  appRouter.use('*', (req, res, next) => {
    next(new NotFoundError('Page not found'));
  });

  return appRouter;
}

module.exports = {
  createRouter,
};
