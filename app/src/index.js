import React from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { reduxStore } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";

import "./init";
import "./assets/icons/remixicon/remixicon.css";
import "./assets/less/index.less";
import "./styles/custom/custom.css";
import "./styles/custom/custom.scss";
import "./styles/custom/postMigrationCustom.scss";
import PageError from "components/misc/PageError";

const persistor = persistStore(reduxStore);
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Provider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <Sentry.ErrorBoundary
          fallback={({ error, componentStack, resetError }) => {
            return <PageError error={error} componentStack={componentStack} resetError={resetError} />;
          }}
          showDialog
        >
          <App />
        </Sentry.ErrorBoundary>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
