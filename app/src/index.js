import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { reduxStore } from "./store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
//Initialize PSMH, StorageService, Firebase, Sentry
import "./init";

import "./assets/icons/remixicon/remixicon.css";
import "./assets/less/index.less";

import "./styles/custom/custom.css";
import "./styles/custom/custom.scss";
import "./styles/custom/postMigrationCustom.scss";
import { Provider } from "react-redux";

const persistor = persistStore(reduxStore);
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <Provider store={reduxStore}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
