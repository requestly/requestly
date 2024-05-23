import React from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, Route, Routes } from "react-router-dom";
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
import SeleniumImporter from "views/misc/SeleniumImporter";
import PATHS from "config/constants/sub/paths";

const persistor = persistStore(reduxStore);
const container = document.getElementById("root");
const root = createRoot(container);

const router = createBrowserRouter([
  {
    path: PATHS.SELENIUM_IMPORTER.RELATIVE,
    element: <SeleniumImporter />,
  },
  {
    path: "/",
    element: (
      <Sentry.ErrorBoundary
        fallback={({ error, componentStack, resetError }) => (
          <PageError error={error} componentStack={componentStack} resetError={resetError} />
        )}
        showDialog
      >
        <App />
      </Sentry.ErrorBoundary>
    ),
    children: [...routes, ...fullScreenRoutes],
  },
]);

root.render(
  <Provider store={reduxStore}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);
