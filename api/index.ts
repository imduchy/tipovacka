import { exportModels } from '@duchynko/tipovacka-models';
import bodyParser from 'body-parser';
import connectMongo from 'connect-mongo';
import express from 'express';
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

const app = express();
const MongoStore = connectMongo(session);

exportModels(mongoose);

try {
  if (!process.env.DB_CONNECTION_STRING) {
    logger.error('Database connection string is undefined');
    process.exit();
  }
  mongoose
    .connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((_) => {
      logger.info('Successfully connected to the database.');
    });
} catch (error) {
  logger.error('Error while connecting to the database. Error: ' + error);
  process.exit();
}

strategy(passport);

app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
}

app.use('/api/auth', auth);
app.use('/api/admin', admin);
app.use('/api/users', users);
app.use('/api/groups', groups);
app.use('/api/games', games);
app.use('/api/bets', bets);

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || 'http://localhost';

app.listen(PORT, () => {
  console.log(`The API is listening at ${HOST}:${PORT}`);
});
