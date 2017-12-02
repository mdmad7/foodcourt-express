import JWT from 'jsonwebtoken';
import passport from 'passport';
import config from '../configuration';
import User from '../models/user';
import { RegExp } from 'core-js/library/web/timers';

const signToken = user =>
  JWT.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.name.first_name,
      lastName: user.name.last_name,
    },
    config.JWT_SECRET,
    {
      expiresIn: '1hr',
    },
  );

export const allUsers = async (req, res) => {
  let limit = parseInt(req.query.limit);
  let page = parseInt(req.query.page, 10);

  // parseInt attempts to parse the value to an integer
  // it returns a special "NaN" value when it is Not a Number.
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit)) {
    limit = 10;
  } else if (limit > 50) {
    limit = 50;
  } else if (limit < 1) {
    limit = 10;
  }
  // Pagination logic for search endpoint.
  let skip = page > 0 ? (page - 1) * limit : 0;

  await User.find(
    {
      isDeleted: { $eq: false },
    },
    {
      _id: 0,
      password: 0,
      updatedAt: 0,
      createdAt: 0,
    },
  )
    .limit(limit)
    .skip(skip)
    .exec((err, users) => {
      if (err) {
        res.json('error has occurred');
      } else {
        res.json(users);
      }
    });
};

export const userProfile = async (req, res) => {
  await User.findOne({
    _id: req.params.id,
    isDeleted: { $eq: false },
  }).exec((err, user) => {
    if (err) {
      res.json('an error occurred');
    } else {
      res.json(user);
    }
  });
};

export const logIn = async (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      res.json({ error: 'authentication failed' });
    }
    if (!user) {
      return res.json({ error: 'Invalid email address or password' });
    }

    const token = signToken(user);
    return res.status(200).json({ message: 'You are logged In', token });
  })(req, res);
};

export const signUp = async (req, res) => {
  // const {} = req.body;

  const foundUser = await User.findOne({ email: req.body.email });

  if (foundUser) {
    return res.status(401).json({ error: 'Email is already is use' });
  }

  const newUser = new User(req.body);

  await newUser.save();

  const token = await signToken(newUser);
  return res.status(200).json({ token });
};

export const updateUser = async (req, res) => {
  const token = req.headers.authorization;
  const decoded = JWT.verify(token, config.JWT_SECRET);

  const foundUsername = await User.findOne({
    email: { $ne: req.body.email },
    username: req.body.username,
  });

  if (foundUsername) {
    return res.status(401).json({ error: 'Username is already is use' });
  }

  const user = new User({
    name: {
      first_name: req.body.name.first_name,
      family_name: req.body.name.last_name,
      other_names: req.body.name.other_names,
    },
    gender: req.body.gender,
    username: req.body.username,
    date_of_birth: req.body.date_of_birth,
    _id: req.params.id,
  });

  // If params.id !== decoded.id then request is being made by another user
  // a user can only change his profile except if the user has admin privileges
  if (req.params.id === decoded.id) {
    await User.findOneAndUpdate(
      req.params.id,
      user,
      { new: true },
      (err, updatedUser) => {
        if (err) {
          res.json(err);
        }

        res.json(updatedUser);
      },
    );
  } else {
    res.status(401).json({ error: 'Unathorized User' });
  }
};

// Route to set user hasDelted flag to true. Faux Delete
export const userDelete = async (req, res) => {
  const token = req.headers.authorization;
  const decoded = JWT.verify(token, config.JWT_SECRET);

  const user = new User({
    isDeleted: true,
    _id: req.params.id,
  });

  // If params.id !== decoded.id then request is being made by another user
  // a user can only change his profile except if the user has admin priveleges
  if (req.params.id === decoded.id || decoded.role === 'Administrator') {
    await User.findOneAndUpdate(
      req.params.id,
      user,
      { new: true },
      (err, updatedUser) => {
        if (err) {
          res.json('an error occurred here');
        }

        res.json(updatedUser);
      },
    );
  } else {
    res.status(401).json({ error: 'Unathorized User' });
  }
};

export const searchUser = async (req, res) => {
  const search = req.query.name;
  let limit = parseInt(req.query.limit);
  let page = parseInt(req.query.page, 10);

  // parseInt attempts to parse the value to an integer
  // it returns a special "NaN" value when it is Not a Number.
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit)) {
    limit = 10;
  } else if (limit > 50) {
    limit = 50;
  } else if (limit < 1) {
    limit = 10;
  }
  // Pagination logic for search endpoint.
  let skip = page > 0 ? (page - 1) * limit : 0;
  // run search variable on all 3 namve object values, $options - case insensive & . wildcard
  // .limit() && .skip() for pagination
  // total number of pages is .count() find results divided by limit
  await User.find({
    $or: [
      { 'name.first_name': { $regex: '.*' + search + '.*', $options: 'is' } },
      { 'name.family_name': { $regex: '.*' + search + '.*', $options: 'is' } },
      { 'name.other_names': { $regex: '.*' + search + '.*', $options: 'is' } },
    ], // regex to search for provided name
    isDeleted: { $eq: false },
  })
    .limit(limit)
    .skip(skip)
    .exec((err, user) => {
      if (err) {
        res.json('an error occurred');
      } else {
        res.json(user);
      }
    });
};
