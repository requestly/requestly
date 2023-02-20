import { trackEvent } from "modules/analytics";
import { APPS } from "../constants";

export const trackAppDetectedEvent = (appName) => {
  const params = { app_name: appName };
  trackEvent(APPS.APP_DETECTED, params);
};

export const trackAppConnectedEvent = (appName) => {
  const params = { app_name: appName };
  trackEvent(APPS.APP_CONNECTED, params);
};

export const trackAppDisconnectedEvent = (appName) => {
  const params = { app_name: appName };
  trackEvent(APPS.APP_DISCONNECTED, params);
};

export const trackAppConnectFailureEvent = (appName) => {
  const params = { app_name: appName };
  trackEvent(APPS.APP_CONNECT_FAILURE, params);
};
