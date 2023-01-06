import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { exportModels } from '@tipovacka/models';
import connectMongo from 'connect-mongo';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import { errorHandler, errorMiddleware } from './middleware/errorMiddleware';
import { securityHeadersMiddleware } from './middleware/headersMiddleware';
import admin from './routes/admin';
import auth from './routes/auth';
import bets from './routes/bets';
import games from './routes/games';
import groups from './routes/groups';
import users from './routes/users';
import getLogger from './utils/logger';
import { validateEnvVars } from './utils/misc';
import strategy from './utils/passport';
import { initializeTelemetry } from './utils/telemetry';

const logger = getLogger();

const requiredEnvVars = {
  KEY_VAULT_URL: process.env.KEY_VAULT_URL,
  CONNECTION_STRING_SECRET_NAME: process.env.CONNECTION_STRING_SECRET_NAME,
  FOOTBALL_API_KEY_SECRET_NAME: process.env.FOOTBALL_API_KEY_SECRET_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  API_ADMIN_TOKEN: process.env.API_ADMIN_TOKEN,
};

const app = express();
const MongoStore = connectMongo(session);
const credential = new DefaultAzureCredential();

// Initialize Application Insights telemetry
initializeTelemetry();

// Don't start the server without all required env variables
const undefinedRequiredEnv = validateEnvVars(requiredEnvVars);

if (undefinedRequiredEnv.length > 0) {
  logger.error(
    `The following required environment variables are undefined: ${undefinedRequiredEnv}.`
  );
  process.exit();
}

const vaultURL = process.env.KEY_VAULT_URL as string;
const kvClient = new SecretClient(vaultURL, credential);

kvClient.getSecret(process.env.CONNECTION_STRING_SECRET_NAME as string).then((secret) => {
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
kvClient.getSecret(process.env.FOOTBALL_API_KEY_SECRET_NAME as string).then((secret) => {
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
    secret: process.env.SESSION_SECRET as string,
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
app.use(securityHeadersMiddleware);

app.use(urlencoded({ extended: false }));
app.use(json());

// Configure passport session
app.use(passport.initialize());
app.use(passport.session());

// Configure CORS
app.use(
  cors({
    origin: [/localhost/, /\.onlinetipovacka\.sk$/],
    credentials: true,
  })
);

app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/users', users);
app.use('/api/groups', groups);
app.use('/api/games', games);
app.use('/api/bets', bets);

app.use(errorMiddleware);

process.on('uncaughtException', async (error: Error) => {
  await errorHandler.handleError(error);

  if (!errorHandler.isTrustedError(error)) process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  throw error;
});

export default app;
