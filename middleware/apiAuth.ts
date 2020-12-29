import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'

export const defaultAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.header('tipovacka-auth-token') === process.env.ADMIN_API_TOKEN) {
    next()
    return
  }

  if (!req.user) {
    logger.warn(`[${req.originalUrl}] Unauthorized request was made from IP: ${req.ip}.`)
    res.status(401).send('Unauthorized request')
  } else {
    next()
  }
}
