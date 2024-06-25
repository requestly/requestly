import React from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { reduxStore } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";

import "./init";
import "./assets/less/index.less";
import "./styles/custom/custom.scss";

import PageError from "components/misc/PageError";
import { routes } from "routes";
import { fullScreenRoutes } from "routes/fullScreenRoutes";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getAppFlavour } from "utils/AppUtils";
import { sessionBearRoutes } from "src-SessionBear/routes";
import SessionBearApp from "src-SessionBear/App";

const persistor = persistStore(reduxStore);
const container = document.getElementById("root");
const root = createRoot(container);
const appFlavour = getAppFlavour();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Sentry.ErrorBoundary
        fallback={({ error, componentStack, resetError }) => (
          <PageError error={error} componentStack={componentStack} resetError={resetError} />
        )}
        showDialog
      >
        {appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? <SessionBearApp /> : <App />}
      </Sentry.ErrorBoundary>
    ),
    children:
      appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR ? sessionBearRoutes : [...routes, ...fullScreenRoutes],
  },
]);

root.render(
  <Provider store={reduxStore}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);
