import { Router } from 'express';
import passport from 'passport';
import expressJoi from 'express-joi-validator';

import * as userController from '../controllers/user';
import passportConfig from '../passport';
import { createUser, updateUser } from '../joiConfig';

const router = Router();

// get all users without
router.get('/users', userController.allUsers);

// get user profile with userid
router.get(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  userController.userProfile,
);

router.patch(
  '/user/avatar',
  passport.authenticate('jwt', { session: false }),
  userController.userAvatar,
);

// signup a user
router.post('/user/signup', expressJoi(createUser), userController.signUp);

// login a user
router.post('/user/login', userController.logIn);

// update a user's profile
router.patch(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  expressJoi(updateUser),
  userController.updateUser,
);

// fake delete by setting isDeleted: true
router.patch(
  '/user/:id/delete',
  passport.authenticate('jwt', { session: false }),
  userController.userDelete,
);

// search user route with provided name
router.get('/users/search/', userController.searchUser);

export default router;
