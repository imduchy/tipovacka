"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let loggerInstance;
function setLogger(logger) {
    loggerInstance = logger;
}
exports.setLogger = setLogger;
function getLogger() {
    return loggerInstance;
}
exports.getLogger = getLogger;
