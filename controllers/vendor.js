import JWT from 'jsonwebtoken';
import passport from 'passport';
import config from '../configuration';
import Vendor from '../models/vendor';

const signToken = vendor =>
  JWT.sign(
    {
      id: vendor.id,
      email: vendor.email,
      name: vendor.name,
    },
    config.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );

export const allVendors = async (req, res) => {
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

  await Vendor.find(
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
    .exec((err, vendors) => {
      if (err) {
        res.json('error has occurred');
      } else {
        res.json(vendors);
      }
    });
};

export const vendorProfile = async (req, res) => {
  await Vendor.findOne({
    _id: req.params.id,
    isDeleted: { $eq: false },
  }).exec((err, vendor) => {
    if (err) {
      res.json('an error occurred');
    } else {
      res.json(vendor);
    }
  });
};
