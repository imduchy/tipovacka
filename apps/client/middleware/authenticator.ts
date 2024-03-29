import { IUser } from '@tipovacka/models';
import { Middleware, Context } from '@nuxt/types';

const authenticatorMiddleware: Middleware = ({ $auth, error }: Context) => {
  const user = $auth.user as IUser;

  if (!user || !user.scope.includes('admin')) {
    return error({ statusCode: 404, message: 'Stránka neexistuje' });
  }
};

export default authenticatorMiddleware;
