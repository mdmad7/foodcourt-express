import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import rfs from 'rotating-file-stream';

import user from './routes/user';

const server = express();
const PORT = 4000;
const logDirectory = path.join(__dirname, 'log');

// setting mongoose connection
const mongoDBURL = 'mongodb://localhost/test';
mongoose.connect(mongoDBURL, { useMongoClient: true });
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
server.use(logger('common', { stream: accessLogStream }));
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use('/v1/api/', user);

// catch 404 and forward to error handler
server.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
server.use((err, req, res) => {
  res.status(500);
  res.send(err);
});

server.listen(PORT, () => console.log(`API Running on localhost:${PORT}`));
