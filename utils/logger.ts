import winston, { format } from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [],
})

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        format.label(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    })
  )
} else {
  // Write all logs with level `error` and below to `error.log`, and
  // Write all logs with level `info` and below to `combined.log`
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }))
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }))
}

export default logger
