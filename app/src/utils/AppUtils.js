import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled } from "actions/ExtensionActions";

export const getAppDetails = () => {
  let app_mode = null;
  let app_version = null;
  let ext_id = null;

  if (document.documentElement.getAttribute("rq-ext-version")) {
    app_mode = GLOBAL_CONSTANTS.APP_MODES.EXTENSION;
    app_version = document.documentElement.getAttribute("rq-ext-version");
    ext_id = window.localStorage.getItem("extID");
  } else if (window?.RQ?.MODE) {
    app_mode = window.RQ.MODE;
    app_version = window?.RQ?.DESKTOP?.VERSION;
  } else {
    app_mode = GLOBAL_CONSTANTS.APP_MODES.REMOTE;
    app_version = "0.0.1"; // DUMMY VERSION for compatibility check
  }

  return { app_mode, app_version, ext_id };
};

export const isDesktopMode = () => {
  return getAppDetails().app_mode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
};
export const isProductionUI =
  window.location.host.includes("app.requestly.io") && !window.testMode;

export const isLocalStoragePresent = (appMode) => {
  return !(
    (appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION &&
      !isExtensionInstalled()) ||
    appMode === GLOBAL_CONSTANTS.APP_MODES.REMOTE
  );
};
