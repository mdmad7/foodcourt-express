import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import config from './configuration';
import User from './models/user';
import Vendor from './models/vendor';

// JSON WEB TOKEN Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: config.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id, { password: 0 });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

// LOCAL STRATEGY FOR USER
passport.use(
  'user',
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          email,
          isDeleted: { $eq: false },
        });

        if (!user) {
          return done(null, false);
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

// LOCAL STRATEGY FOR VENDOR
passport.use(
  'vendor',
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const vendor = await Vendor.findOne({
          email,
          isDeleted: { $eq: false },
        });

        if (!vendor) {
          return done(null, false);
        }

        const isMatch = await vendor.isValidPassword(password);

        if (!isMatch) {
          return done(null, false);
        }

        return done(null, vendor);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

// PASSPORT FACEBOOK STRATEGY
passport.use(
  new FacebookStrategy(
    {
      clientID: config.FACEBOOK_APP_ID,
      clientSecret: config.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:4000/user/auth/facebook/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await User.findOrCreate((err, user) => {
          if (err) {
            return done(err);
          }
          done(null, user);
        });
      } catch (error) {
        console.log(error);
      }
    },
  ),
);

// PASSPORT GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/user/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        await User.findOrCreate({ googleId: profile.id }, (err, user) => {
          return done(err, user);
        });
      } catch (error) {
        console.log(error);
      }
    },
  ),
);

// PASSPORT TWITTER STRATEGY
passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.TWITTER_CONSUMER_KEY,
      consumerSecret: config.TWITTER_CONSUMER_SECRET,
      callbackURL: 'http://localhost:4000/user/auth/twitter/callback',
    },
    async (token, tokenSecret, profile, done) => {
      try {
        await User.findOrCreate((err, user) => {
          if (err) {
            return done(err);
          }
          done(null, user);
        });
      } catch (error) {
        console.log(error);
      }
    },
  ),
);
