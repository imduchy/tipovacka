import { MongoStore } from 'connect-mongo';
import session from 'express-session';

export default (store: session.MemoryStore | MongoStore) =>
  session({
    secret: process.env.SESSION_SECRET as string,
    cookie: {
      maxAge: 172800000,
      sameSite: 'lax',
    },
    resave: true,
    saveUninitialized: true,
    store: store,
    //   process.env.NODE_ENV === 'production'
    //     ? new MongoStore({
    //         mongooseConnection: mongoose.connection,
    //         ttl: 24 * 60 * 60 * 1000,
    //         autoRemove: 'internal',
    //         autoRemoveInterval: 10,
    //       })
    //     : new session.MemoryStore(),
  });
