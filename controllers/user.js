import JWT from 'jsonwebtoken';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import mkdirp from 'mkdirp';
import config from '../configuration';
import User from '../models/user';
import { decode } from 'punycode';

const createRefreshToken = user =>
  JWT.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh',
    },
    config.JWT_SECRET,
    {
      expiresIn: '24h',
    },
  );

const signToken = user =>
  JWT.sign(
    {
      id: user.id,
      email: user.email,
      first_name: user.name.first_name,
      last_name: user.name.last_name,
    },
    config.JWT_SECRET,
    {
      expiresIn: '1m',
    },
  );

export const allUsers = async (req, res) => {
  try {
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
  } catch (error) {
    throw new Error(error);
  }
};

export const userProfile = async (req, res) => {
  try {
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
  } catch (error) {
    throw new Error(error);
  }
};

export const userAvatar = async (req, res, next) => {
  const token = req.headers.authorization;
  const decoded = JWT.verify(token, config.JWT_SECRET);

  const storage = multer.diskStorage({
    destination: './public/uploads/avatar/',
    filename: function(req, file, cb) {
      cb(null, decoded.id + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function(req, file, cb) {
      // Ensure image upload only
      fileTypeCheck(file, cb);
    },
  }).single('avatar');

  // file type checking function
  function fileTypeCheck(file, cb) {
    // Allowed files using regex
    const filetypes = /jpeg|jpg|png/;
    // check extention
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    //check mimetype
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!!!');
    }
  }

  await upload(req, res, err => {
    if (err) {
      res.json(err);
    } else {
      if (req.file === undefined) {
        res.json({ error: 'no file selected' });
      } else {
        let pipeline = sharp(req.file.path);

        // create directories if they do not exist
        mkdirp('./public/uploads/avatar/default/');
        mkdirp('./public/uploads/avatar/720x720/');
        mkdirp('./public/uploads/avatar/360x360/');
        mkdirp('./public/uploads/avatar/180x180/');

        // chained sharpjs to create several instances of req.file
        // using clone()
        pipeline
          .clone()
          .resize(960, 960)
          .toFile(
            `./public/uploads/avatar/default/${decoded.id}${path.extname(
              req.file.originalname,
            )}`,
          )
          .then(() => {
            pipeline
              .clone()
              .resize(720, 720)
              .toFile(
                `./public/uploads/avatar/720x720/${
                  decoded.id
                }720x720${path.extname(req.file.originalname)}`,
              );
          })
          .then(() => {
            pipeline
              .clone()
              .resize(360, 360)
              .toFile(
                `./public/uploads/avatar/360x360/${
                  decoded.id
                }360x360${path.extname(req.file.originalname)}`,
              );
          })
          .then(() => {
            pipeline
              .clone()
              .resize(180, 180)
              .toFile(
                `./public/uploads/avatar/180x180/${
                  decoded.id
                }180x180${path.extname(req.file.originalname)}`,
              )
              .then(file => {
                const user = new User({
                  img: {
                    original: `/static/uploads/avatar/default/${
                      decoded.id
                    }${path.extname(req.file.originalname)}`,
                    thumbnail720x720: `/static/uploads/avatar/720x720/${
                      decoded.id
                    }720x720${path.extname(req.file.originalname)}`,
                    thumbnail360x360: `/static/uploads/avatar/360x360/${
                      decoded.id
                    }360x360${path.extname(req.file.originalname)}`,
                    thumbnail180x180: `/static/uploads/avatar/180x180/${
                      decoded.id
                    }180x180${path.extname(req.file.originalname)}`,
                  },
                  _id: decoded.id,
                });
                User.findByIdAndUpdate(
                  decoded.id,
                  user,
                  // { new: true },
                  (err, updatedUser) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(updatedUser);
                  },
                );
              })
              .then(() => {
                // remove original file uploaded by multer
                fs.unlink(
                  `./public/uploads/avatar/${decoded.id}${path.extname(
                    req.file.originalname,
                  )}`,
                );
              });
          });

        res.json({ message: 'Image Uploaded!!!' });
      }
    }
  });
};

export const logIn = (req, res) => {
  passport.authenticate('user', async (err, user) => {
    if (err) {
      res.json({ error: 'authentication failed' });
    }
    if (!user) {
      return res
        .status(401)
        .send({ message: 'Invalid email address or password', success: false });
    }

    const hasRefreshToken = await User.findOne(
      {
        email: req.body.email,
      },
      { refreshToken: 1 },
    );

    const token = await signToken(user);
    const decoded = JWT.decode(hasRefreshToken.refreshToken, config.JWT_SECRET);
    let refreshToken = '';
    if (!hasRefreshToken.refreshToken && decoded.exp < Date.now() / 1000) {
      refreshToken = await createRefreshToken(user);
      await User.findOneAndUpdate(
        { email: req.body.email },
        { $set: { refreshToken: refreshToken } },
      );
    } else {
      refreshToken = hasRefreshToken.refreshToken;
    }

    return res.status(200).json({
      message: 'You are logged In',
      token,
      refreshToken,
      success: true,
    });
  })(req, res);
};

export const signUp = async (req, res) => {
  // const {} = req.body;

  const foundUser = await User.findOne({ email: req.body.email });

  if (foundUser) {
    return res.status(401).json({ error: 'Email is already is use' });
  }

  const newUser = new User({
    name: {
      first_name: req.body.name.first_name,
      family_name: req.body.name.family_name,
      other_names: req.body.name.other_names ? req.body.name.other_names : '',
      full_name: req.body.name.other_names
        ? `${req.body.name.first_name} ${req.body.name.other_names} ${
            req.body.name.family_name
          }`
        : `${req.body.name.first_name} ${req.body.name.family_name}`,
    },
    gender: req.body.gender,
    username: `${req.body.email.split('@')[0]}`,
    email: req.body.email,
    password: req.body.password,
    date_of_birth: req.body.date_of_birth,
  });

  await newUser.save();

  const token = await signToken(newUser);
  const refreshToken = await createRefreshToken(newUser);

  await User.findOneAndUpdate(
    { email: req.body.email },
    { $set: { refreshToken: refreshToken } },
  );

  return res.status(201).json({ success: true, token, refreshToken });
};

export const tokenRefreshner = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const decoded = JWT.verify(refreshToken, config.JWT_SECRET);

  const findUser = await User.findOne({
    _id: decoded.id,
    isDeleted: { $eq: false },
  });

  console.log(findUser);

  if (
    findUser.refreshToken === refreshToken &&
    decoded.exp < Date.now() / 1000
  ) {
    res.status(200).json({ hasExpired: true });
  } else if (findUser.refreshToken !== refreshToken) {
    res.status(200).json({ hasExpired: true });
  } else {
    const token = await signToken(findUser);
    res.status(200).json({ hasExpired: false, token });
  }

  // if(refreshToken === decoded.)
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
      family_name: req.body.name.family_name,
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
  // run search variable on all 3 name object values, $options - case insensive & . wildcard
  // .limit() && .skip() for pagination
  // total number of pages is .count() find results divided by limit
  await User.find(
    {
      $or: [
        { 'name.full_name': { $regex: '.*' + search + '.*', $options: 'is' } },
      ], // regex to search for provided name
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
    .exec((err, user) => {
      if (err) {
        res.json('an error occurred');
      } else {
        res.json(user);
      }
    });
};
