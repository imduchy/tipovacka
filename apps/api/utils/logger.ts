import winston, { format } from 'winston';

const logger = winston.createLogger({
  level: 'info',
  transports: [],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        format.colorize(),
        format.prettyPrint({ depth: 10 }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json(),
        format.printf((info) => `[${info.level}]: ${info.message}`)
      ),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => `[${info.level}] ${info.timestamp}: ${info.message}`)
      ),
    })
  );
}

export default logger;
