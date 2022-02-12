export class EmptyApiResponseError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, EmptyApiResponseError.prototype);
  }
}

export class FootballApiResponseError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, EmptyApiResponseError.prototype);
  }
}

export class EmptyDatabaseResponseError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, EmptyDatabaseResponseError.prototype);
  }
}
