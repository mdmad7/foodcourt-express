import JWT from 'jsonwebtoken';
import passport from 'passport';
import config from '../configuration';
import User from '../models/user';

const signToken = user =>
  JWT.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    config.JWT_SECRET,
    {
      expiresIn: '1hr',
    },
  );

export const allUsers = async (req, res) => {
  await User.find(
    {
      hasDeleted: { $eq: false },
    },
    {
      password: 0,
      updatedAt: 0,
      createdAt: 0,
    },
  ).exec((err, users) => {
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
    hasDeleted: { $eq: false },
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
      // return res.status(404).json({ error: 'Invalid email address or password' });
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

export const updateUser = (req, res) => {
  const token = req.headers.authorization;
  const decoded = JWT.verify(token, config.JWT_SECRET);

  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    other_names: req.body.other_names,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    hasDeleted: false,
    hasVoted: false,
    _id: req.params.id,
  });

  // If params.id !== decoded.id then request is being made by another user
  // a user can only change his profile except if the user has admin privileges
  if (req.params.id === decoded.id || decoded.role === 'Administrator') {
    User.findOneAndUpdate(
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
    hasDeleted: true,
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
