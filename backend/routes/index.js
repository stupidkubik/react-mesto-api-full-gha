const router = require('express').Router();

const userRouter = require('./users');
const cardRouter = require('./cards');
const signupRouter = require('./signupRouter');
const signinRouter = require('./signinRouter');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

router.use('/signup', signupRouter);
router.use('/signin', signinRouter);
router.use(auth);
router.use('/users', userRouter);
router.use('/cards', cardRouter);
router.use('*', (req, res, next) => {
  next(new NotFoundError('Page not found'));
});

module.exports = router;
