import { Request } from 'express'

export const isLoggedIn = (req: Request): boolean => {
  return req.user !== undefined
}

export const isAdmin = (req: Request): boolean => {
  return req.header('tipovacka-auth-token') === process.env.ADMIN_API_TOKEN
}
