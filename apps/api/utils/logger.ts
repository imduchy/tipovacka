import bunyan from 'bunyan';

const logger = bunyan.createLogger({
  name: process.env.NODE_ENV === 'production' ? 'aca-tipovacka-api-prod' : 'aca-tipovacka-api-test',
});

export default logger;
