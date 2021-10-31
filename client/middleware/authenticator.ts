import { IUser } from '@duchynko/tipovacka-models';
import { Middleware, Context } from '@nuxt/types';

const authenticatorMiddleware: Middleware = ({ $auth, error }: Context) => {
  const user = $auth.user as IUser & { scope: string };

  if (!user || user.scope !== 'admin') {
    return error({ statusCode: 404, message: 'Stránka neexistuje' });
  }
};

export default authenticatorMiddleware;
