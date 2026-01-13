import * as Sentry from "@sentry/react";

/**
 * Wrapper over Sentry.startSpan that ensures the transaction name is set in the current scope
 * This allows Sentry.captureException() calls within the span to be associated with the custom transaction
 * @returns A function with same signature as the callback that when called, executes the span with the custom transaction
 */
export const wrapWithCustomSpan = <T, Args extends any[] = []>(
  options: Parameters<typeof Sentry.startSpan>[0],
  callback: (...args: Args) => T
) => {
  return (...args: Args) => {
    return Sentry.startSpan(
      {
        ...options,
      },
      (span) => {
        // Important to tag error with the current transaction for dashboarding
        // https://docs.sentry.io/platforms/javascript/enriching-events/transaction-name/
        if (options?.forceTransaction) {
          Sentry.getCurrentScope().setTransactionName(options.name);
        }

        // This needs to return the promise from the callback else span won't register async callbacks
        return callback(...args);
      }
    );
  };
};
