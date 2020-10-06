import { PropertyRequiredError, ValidationError } from '../utils/exceptions'
import logger from '../utils/logger'

export const validateInput = ({
  username,
  email,
  password,
  password2,
  groupId,
}: {
  username: string
  email: string
  password: string
  password2: string
  groupId: string
}) => {
  if (
    !username === undefined ||
    !email === undefined ||
    !password === undefined ||
    !password2 === undefined ||
    !groupId === undefined
  ) {
    logger.error(
      `Not all required variables were provided in the request. ` +
        `Username: ${username}, Email: ${email}, ` +
        `Password #: ${password.length}, Password2 #: ${password2.length}`
    )
    throw new PropertyRequiredError(
      "You didn't provide all required information."
    )
  }

  if (password !== password2) {
    logger.error(
      `Passwords provided in the request are not matching. ` +
        `Username: ${username}, Email: ${email}.`
    )
    throw new ValidationError("Passwords don't match.")
  }

  if (password.length < 6) {
    logger.error(
      `Password provided in the request wasn't long enough. ` +
        `Username: ${username}, Email: ${email}, Password #: ${password.length}.`
    )
    throw new ValidationError('Password is too short.')
  }
}
