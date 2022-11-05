import { exportModels } from '@tipovacka/models';
import connectMongo from 'connect-mongo';
import express, { json, urlencoded } from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import strategy from './utils/passport';
import logger from './utils/logger';
import admin from './routes/admin';
import auth from './routes/auth';
import bets from './routes/bets';
import games from './routes/games';
import groups from './routes/groups';
import users from './routes/users';
import cors from 'cors';
import helmet from 'helmet';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

const app = express();
const MongoStore = connectMongo(session);
const credential = new DefaultAzureCredential();

// Check if all required environment variables are set.
if (!process.env.KEY_VAULT_URL) {
  logger.error('Value for the KEY_VAULT_URL is undefined.');
  process.exit();
}

if (!process.env.CONNECTION_STRING_SECRET_NAME) {
  logger.error('Value for the CONNECTION_STRING_SECRET_NAME is undefined.');
  process.exit();
}

if (!process.env.FOOTBALL_API_KEY_SECRET_NAME) {
  logger.error('Value for the FOOTBALL_API_KEY_SECRET_NAME is undefined.');
  process.exit();
}

if (!process.env.SESSION_SECRET) {
  logger.error('Value for the SESSION_SECRET is undefined.');
  process.exit();
}

if (!process.env.API_ADMIN_TOKEN) {
  logger.error('Value for the API_ADMIN_TOKEN is undefined.');
  process.exit();
}

// Initialize Key Vault client and fetch secrets
const vaultURL = process.env.KEY_VAULT_URL;
const kvClient = new SecretClient(vaultURL, credential);
kvClient.getSecret(process.env.CONNECTION_STRING_SECRET_NAME).then((secret) => {
  if (!secret.value) {
    logger.error('Database connection string is undefined.');
    process.exit();
  }

  mongoose.connect(secret.value).then(() => {
    logger.info('Successfully connected to the database.');
  });

  // Export mongoose models
  exportModels(mongoose);
});

// Set the football API key
kvClient.getSecret(process.env.FOOTBALL_API_KEY_SECRET_NAME).then((secret) => {
  if (!secret.value) {
    logger.error('Football API key string is undefined.');
    process.exit();
  }
  process.env.API_FOOTBALL_KEY = secret.value;
});

// Configure passport strategy
strategy(passport);
app.set('trust proxy', 1);

// Configure session store for cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 172800000,
      sameSite: 'lax',
    },
    resave: true,
    saveUninitialized: true,
    // Use MongoStore only in production. In development, use MemoryStore instead
    store:
      process.env.NODE_ENV === 'production'
        ? new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 24 * 60 * 60 * 1000,
            autoRemove: 'internal',
            autoRemoveInterval: 10,
          })
        : new session.MemoryStore(),
  })
);

// Enable secure response headers
// https://hackernoon.com/nodejs-security-headers-101-mf9k24zn
app.use(
  helmet({
    dnsPrefetchControl: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(urlencoded({ extended: false }));
app.use(json());

// Configure passport session
app.use(passport.initialize());
app.use(passport.session());

// Configure CORS
app.use(
  cors({
    origin: /\.onlinetipovacka\.sk$/,
    credentials: true,
  })
);

app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/users', users);
app.use('/api/groups', groups);
app.use('/api/games', games);
app.use('/api/bets', bets);

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || 'http://localhost';

app.listen(PORT, () => {
  logger.info(`The API is listening at ${HOST}:${PORT}`);
});
