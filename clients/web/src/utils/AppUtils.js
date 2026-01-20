import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { getUserOS } from "./osUtils";
export const getAppDetails = () => {
  let app_mode = null;
  let app_version = null;
  let ext_id = null;

  if (document.documentElement.getAttribute("rq-ext-version")) {
    app_mode = GLOBAL_CONSTANTS.APP_MODES.EXTENSION;
    app_version = document.documentElement.getAttribute("rq-ext-version");
    ext_id = document.documentElement.getAttribute("rq-ext-id");
  } else if (window?.RQ?.MODE) {
    app_mode = window.RQ.MODE;
    app_version = window?.RQ?.DESKTOP?.VERSION;
  } else {
    app_mode = GLOBAL_CONSTANTS.APP_MODES.EXTENSION;
    app_version = "0.0.1"; // DUMMY VERSION for compatibility check
  }
  const os = getUserOS();
  return { app_mode, app_version, ext_id, os };
};

export const isDesktopMode = () => {
  return getAppDetails().app_mode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;
};
export const isProductionUI =
  (window.location.host.includes("app.requestly.io") ||
    window.location.host.includes("beta.requestly.io") ||
    window.location.host.includes("app.sessionbear.com") ||
    window.location.host.includes("beta.sessionbear.com")) &&
  !window.testMode;

export const isLocalStoragePresent = (appMode) => {
  return !(appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION && !isExtensionInstalled());
};

export const isAppOpenedInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // Browsers can block access to window.top due to same origin policy.
    return true;
  }
};

export const getAppFlavour = () => {
  // TEMP: ADDED PARAMS FOR SESSIONBEAR, FOR TESTING ON LOCAL ENV. TO BE REMOVED BEFORE RELEASE
  const queryParams = new URLSearchParams(window.location.search);
  if (
    window.location.host.includes("app.sessionbear.com") ||
    window.location.host.includes("beta.sessionbear.com") ||
    queryParams.get("flavour") === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR
  ) {
    return GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR;
  }

  return GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY;
};

export const isSetappBuild = () => {
  return isDesktopMode() && !!window.RQ?.DESKTOP?.IS_SETAPP_BUILD;
};

export const getDesktopFlavour = () => {
  if (isSetappBuild()) {
    return GLOBAL_CONSTANTS.DESKTOP_FLAVOURS.SETAPP;
  }
  return null;
};
