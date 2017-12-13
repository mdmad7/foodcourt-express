import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import rfs from 'rotating-file-stream';
import boom from 'express-boom';

import user from './routes/user';
import vendor from './routes/vendor';
import config from './configuration';

const server = express();
const PORT = process.env.PORT || 4000;
const logDirectory = path.join(__dirname, 'log');

// setting mongoose connection
// const mongoDBURL = 'mongodb://localhost/test';
mongoose.connect(config.mongoDBURL, { useMongoClient: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // we're connected!
  console.log('DB Connection opened');
});

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory,
});

// Express middlewares
server.use(boom());
server.use(logger('common'));
server.use(logger('common', { stream: accessLogStream }));
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use('/static', express.static(path.join(__dirname, 'public')));
// server.use(express.static('public'));

server.use('/v1/api/', user);
server.use('/v1/api/', vendor);

// catch 404 and forward to error handler
server.use((req, res, next) => {
  res.boom.notFound(); // Responds with a 404 status code
});

// error handler
server.use((err, req, res, next) => {
  if (err.isBoom) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }
});

server.listen(PORT, () => console.log(`API Running on localhost:${PORT}`));
