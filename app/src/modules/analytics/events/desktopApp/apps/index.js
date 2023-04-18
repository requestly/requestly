import { trackEvent } from "modules/analytics";
import { APPS } from "../constants";

export const trackAppDetectedEvent = (appName) => {
  const params = { app_name: appName };
  trackEvent(APPS.APP_DETECTED, params);
};

export const trackAppConnectedEvent = (appName, app_count, app_type) => {
  const params = { app_name: appName, app_count, app_type };
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

export const trackConnectAppsClicked = (source) => {
  const params = { source };
  trackEvent(APPS.CONNECT_APPS_CLICKED, params);
};

export const trackSystemWideConnected = (source) => {
  const params = { source };
  trackEvent(APPS.SYSTEMWIDE_CONNECTED, params);
};

export const trackAppSetupInstructionsViewed = (app_name, app_count) => {
  const params = { app_count, app_name };
  trackEvent(APPS.APP_SETUP_INSTRUCTIONS_VIEWED, params);
};
