import { Context } from '@azure/functions';

/**
 * Default Function context with modified log object used in integration tests.
 *
 * @param queueItem item retrieved from a queue and passed into the handler
 * @returns Context object
 */
export const queueTriggerContext = (queueItem: unknown): Context => {
  const ctx = {
    bindings: {
      queueItem: queueItem,
    },
    log: (function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // const main = <any>jest.fn();
      // main.error = jest.fn();
      // main.warn = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const main = <any>jest.fn().mockImplementation((msg) => console.log(msg));
      main.error = jest.fn().mockImplementation((msg) => console.error(msg));
      main.warn = jest.fn().mockImplementation((msg) => console.warn(msg));
      return main;
    })(),
    bindingData: undefined,
    bindingDefinitions: undefined,
    executionContext: undefined,
    invocationId: undefined,
    traceContext: undefined,
    done: undefined,
  };

  return { ...ctx };
};
