import { Router } from 'express';
import passport from 'passport';
import * as userController from '../controllers/user';
import passportConfig from '../passport';

const router = Router();

router.get('/users', userController.allUsers);

router.get(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  userController.userProfile,
);

router.post('/user/signup', userController.signUp);

router.post('/user/login', userController.logIn);

router.put(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  userController.signUp,
);

router.patch(
  '/user/:id/delete',
  passport.authenticate('jwt', { session: false }),
  userController.userDelete,
);

export default router;
