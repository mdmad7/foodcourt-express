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

// refresh user token when it expires
router.post('/user/refreshtoken', userController.tokenRefreshner);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/user/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get(
  '/user/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/login',
  }),
);

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
router.get('/user/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get(
  '/user/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/home',
    failureRedirect: '/login',
  }),
);

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
router.get(
  '/user/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'],
  }),
);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get(
  '/user/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res)=> {
    res.redirect('/home');
  },
);

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
