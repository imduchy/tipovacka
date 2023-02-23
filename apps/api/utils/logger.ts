import bunyan from 'bunyan';

let loggerInstance: bunyan;

const getLogger = (): bunyan => {
  if (!loggerInstance) {
    loggerInstance = bunyan.createLogger({
      name:
        process.env.NODE_ENV === 'production' ? 'aca-tipovacka-api-prod' : 'aca-tipovacka-api-test',
    });
  }

  return loggerInstance;
};

export default getLogger;
