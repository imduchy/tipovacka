import pino from 'pino';

let loggerInstance: pino.Logger;

const getLogger = (): pino.Logger => {
  if (!loggerInstance) {
    if (process.env.ENV !== 'production') {
      loggerInstance = pino({
        transport: {
          levels: 'debug',
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });
    } else {
      loggerInstance = pino();
    }
  }

  return loggerInstance;
};

export default getLogger;
