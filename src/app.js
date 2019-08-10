import express from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import Authify from 'authifyjs';

import logger from './logger';

import baseRoutes from './routes/baseRoutes';
import profileRoutes from './routes/profileRoutes';
import repoRoutes from './routes/repoRoutes';
import repoQueueRoutes from './routes/repoQueueRoutes';
import queryQueueRoutes from './routes/queryQueueRoutes';
import supersearchRoutes from './routes/supersearchRoutes';

const {
  AUTH_JWT_SECRET,
  AUTH_JWT_ISSUER,
  AUTH_JWT_AUDIENCE,
  AUTH_JWT_EXPIRY,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET
} = process.env;

// connect to Mongo DB
logger.info(`Connecting to ${process.env.MONGO_URI}..`);
mongoose.connect(process.env.MONGO_URI);
logger.info(`Connected to ${process.env.MONGO_URI}`);

const app = express();

app.use(helmet());

app.use(
  morgan('combined', {
    // stream: logger.stream,
    skip: () => app.get('env') === 'test'
  })
);

// enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Enable social auth
// Uncomment this to enable social authentication
Authify.init({
  mongoUri: process.env.MONGO_URI,
  app,
  opts: {
    useClassic: true,
    useFacebook: true,
    facebook: {
      clientId: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET
    }
  },
  jwt: {
    secret: AUTH_JWT_SECRET,
    issuer: AUTH_JWT_ISSUER,
    audience: AUTH_JWT_AUDIENCE,
    expiry: AUTH_JWT_EXPIRY
  }
});

// Routes
app.use('/', baseRoutes);
app.use('/profiles', profileRoutes);
app.use('/repos', repoRoutes);
app.use('/reposqueue', repoQueueRoutes);
app.use('/queriesqueue', queryQueueRoutes);
app.use('/supersearch', supersearchRoutes);
// app.use('/subscription', subscriptionRoutes);
// app.use('/user', userRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.httpCode = '404';
  err.code = '404';
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const { code, message } = err;
  res.status(err.httpCode || 500).json({ code, message });
});

export default app;
