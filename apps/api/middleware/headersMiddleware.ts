import helmet from 'helmet';

export const securityHeadersMiddleware = helmet({
  dnsPrefetchControl: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});
