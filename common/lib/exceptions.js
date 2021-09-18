"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmptyApiResponseError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, EmptyApiResponseError.prototype);
    }
}
exports.EmptyApiResponseError = EmptyApiResponseError;
class FootballApiResponseError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, EmptyApiResponseError.prototype);
    }
}
exports.FootballApiResponseError = FootballApiResponseError;
class EmptyDatabaseResponseError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, EmptyDatabaseResponseError.prototype);
    }
}
exports.EmptyDatabaseResponseError = EmptyDatabaseResponseError;
