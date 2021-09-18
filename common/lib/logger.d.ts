interface ProvidedLogger {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}
export declare function setLogger(logger: ProvidedLogger): void;
export declare function getLogger(): ProvidedLogger;
export {};
