window.globalUnhandledRejectionHandlers = new Set();

/**
* We are adding our own unhandledrejection handler before anyone does so that we have the ability
* to act before everyone else.
* This currently caters to our APIClientErrorBoundary where we need to decorate the error object
* before it's captured by sentry.
*/
window.addEventListener("unhandledrejection", (event) => {
  if (!window.globalUnhandledRejectionHandlers && !(window.globalUnhandledRejectionHandlers instanceof Set)) {
    console.warn("globalUnhandledRejectionHandlers is either not set or is not a Set", {
      extra: {
        value: window.globalUnhandledRejectionHandlers,
      }
    });
    return;
  }
  for (const handler of window.globalUnhandledRejectionHandlers) {
    try {
      handler(event);
    } catch (e) {
      console.error("Could not execute a global unhandled rejection handler", e);
    }
  }
});
