import * as Sentry from "@sentry/react";

/**
 * Wrapper over Sentry.startSpan that ensures the transaction name is set in the current scope
 * This allows Sentry.captureException() calls within the span to be associated with the custom transaction
 * @returns A function with same signature as the callback that when called, executes the span with the custom transaction
 */
export const wrapWithCustomTransaction = <T, Args extends any[] = []>(
  options: Parameters<typeof Sentry.startSpan>[0],
  callback: (...args: Args) => T,
  newTrace: boolean = false // This is custom over Sentry Signature
): ((...args: Args) => T) => {
  return (...args: Args) => {
    const wrappedCallback = Sentry.startSpan(
      {
        ...options,
        forceTransaction: true,
      },
      (span) => {
        // Important to tag error with the current transaction for dashboarding
        // https://docs.sentry.io/platforms/javascript/enriching-events/transaction-name/
        Sentry.getCurrentScope().setTransactionName(options.name);

        // To get access to span within callback, use Sentry.getCurrentSpan()
        return callback(...args);
      }
    );
    if (newTrace) return Sentry.startNewTrace(() => wrappedCallback);
    else return wrappedCallback;
  };
};
