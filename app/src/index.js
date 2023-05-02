import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { reduxStore } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { ErrorBoundary } from "components/common/ErrorBoundary";
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
        <ErrorBoundary fallback={<PageError />}>
          <App />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
