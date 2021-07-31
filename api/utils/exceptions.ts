export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PropertyRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PropertyRequiredError';
  }
}

export class FootballApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FootballApiResponseError';
  }
}

export class NoResultsInApiResponseError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, NoResultsInApiResponseError.prototype);
  }
}
