import { IUser, User } from '@tipovacka/models';
import bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import logger from '../utils/logger';

export default (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      { usernameField: 'username', passwordField: 'password' },
      (username: string, password: string, done: any) => {
        User.findOne({ username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: `A user with username ${username} is not registered.`,
              });
            }

            bcrypt.compare(password, user.password!, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Password incorrect' });
              }
            });
          })
          .catch((err) =>
            logger.error(
              `An error while trying to retrieve an user from the database. Error: ${err}`
            )
          );
      }
    )
  );

  passport.serializeUser((user, done) => {
    const userWithId = user as IUser & { id: string };
    done(null, userWithId.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .populate({
        path: 'bets',
        model: 'bet',
        populate: { path: 'game', model: 'game' },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err, null));
  });
};
