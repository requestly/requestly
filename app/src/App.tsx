import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routesV2 } from "routes";
import * as Sentry from "@sentry/react";

declare global {
  namespace globalThis {
    var globalUnhandledRejectionHandlers: Set<(event: PromiseRejectionEvent) => void>;
  }
}
window.globalUnhandledRejectionHandlers = new Set<(event: PromiseRejectionEvent) => void>();

/**
* We are adding our own unhandledrejection handler before anyone does so that we have the ability
* to act before everyone else.
* This currently caters to our APIClientErrorBoundary where we need to decorate the error object
* before it's captured by sentry.
*/
window.addEventListener("unhandledrejection", (event) => {
  console.log("got rejection", globalUnhandledRejectionHandlers, Date.now());
  if (!globalUnhandledRejectionHandlers && !(globalUnhandledRejectionHandlers instanceof Set)) {
    Sentry.captureMessage("globalUnhandledRejectionHandlers is either not set or is not a Set", {
      extra: {
        value: globalUnhandledRejectionHandlers,
      }
    });
    return;
  }
  for (const handler of globalUnhandledRejectionHandlers) {
    try {
      handler(event);
    } catch (e) {
      console.error("Could not execute a global unhandled rejection handler", e);
      Sentry.captureException(e);
    }
  }
});

/** Common things which do not depend on routes for App **/
const App = () => {
  const router = Sentry.wrapCreateBrowserRouter(createBrowserRouter)(routesV2);

  return <RouterProvider router={router} />;
};

export default App;
