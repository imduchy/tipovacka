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
import initializeAuthenticator from './middleware/passportAuthenticator';
import sessionMiddleware from './middleware/sessionMiddleware';
import admin from './routes/admin';
import auth from './routes/auth';
import bets from './routes/bets';
import games from './routes/games';
import groups from './routes/groups';
import users from './routes/users';
import { validateEnvVars } from './utils/misc';

// Initialize telemetry before creating a logger
import { initializeTelemetry } from './utils/telemetry';
import getLogger from './utils/logger';

// Initialize Application Insights telemetry
initializeTelemetry();
const logger = getLogger();

const requiredEnvVars = {
  KEY_VAULT_URL: process.env.KEY_VAULT_URL,
  CONNECTION_STRING_SECRET_NAME: process.env.CONNECTION_STRING_SECRET_NAME,
  FOOTBALL_API_KEY_SECRET_NAME: process.env.FOOTBALL_API_KEY_SECRET_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  API_ADMIN_TOKEN: process.env.API_ADMIN_TOKEN,
};

const app = express();
const credential = new DefaultAzureCredential();

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
    exportModels(mongoose);
  });
});

// Set the football API key
kvClient.getSecret(process.env.FOOTBALL_API_KEY_SECRET_NAME as string).then((secret) => {
  if (!secret.value) {
    logger.error('Football API key string is undefined.');
    process.exit();
  }
  process.env.API_FOOTBALL_KEY = secret.value;
});

// Configure authentication strategy
initializeAuthenticator(passport);
// app.set('trust proxy', 1);

// Configure session store for cookies
let sessionStore = undefined;

if (process.env.NODE_ENV === 'production') {
  const mongoStore = connectMongo(session);
  sessionStore = new mongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 * 1000,
    autoRemove: 'internal',
    autoRemoveInterval: 10,
  });
} else {
  sessionStore = new session.MemoryStore();
}

app.use(sessionMiddleware(sessionStore));

// Enable secure response headers
// https://hackernoon.com/nodejs-security-headers-101-mf9k24zn
app.use(securityHeadersMiddleware);

// Enable body parser
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

// Routes
app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/users', users);
app.use('/api/groups', groups);
app.use('/api/games', games);
app.use('/api/bets', bets);

// Centralised error handling
app.use(errorMiddleware);

process.on('unhandledRejection', (error: Error) => {
  throw error;
});

process.on('uncaughtException', async (error: Error) => {
  await errorHandler.handleError(error);

  if (!errorHandler.isTrustedError(error)) process.exit(1);
});

export default app;
