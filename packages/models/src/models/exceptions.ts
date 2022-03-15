export class UserSchemaPreHookError extends Error {
  constructor(message: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UserSchemaPreHookError.prototype);
  }
}

export class UserSchemaPostHookError extends Error {
  constructor(message: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UserSchemaPreHookError.prototype);
  }
}
