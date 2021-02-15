export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class PropertyRequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PropertyRequiredError'
  }
}
