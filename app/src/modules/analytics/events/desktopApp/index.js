import { trackEvent } from "modules/analytics";
import {
  BACKGROUND_PROCESS_STARTED,
  DESKTOP_APP_STARTED,
  PROXY_SERVER_STARTED,
  PROXY_PORT_CHANGED,
  INVALID_PROXY_PORT_INPUT,
  PROXY_RESTARTED,
  USER_DENIED_CLOSING_LAUNCHED_APPS,
  PROXY_PORT_CHANGE_REQUESTED,
  TRAFFIC_TABLE,
} from "./constants";

export const trackProxyServerStartedEvent = () => {
  const params = {};
  trackEvent(PROXY_SERVER_STARTED, params);
};

export const trackBackgroundProcessStartedEvent = () => {
  const params = {};
  trackEvent(BACKGROUND_PROCESS_STARTED, params);
};

export const trackProxyReStartedEvent = () => {
  const params = {};
  trackEvent(PROXY_RESTARTED, params);
};

export const trackDesktopAppStartedEvent = () => {
  const params = {};
  trackEvent(DESKTOP_APP_STARTED, params);
};

export const trackProxyPortChanged = (newPort) => {
  const params = { newPort };
  trackEvent(PROXY_PORT_CHANGED, params);
};

export const trackInvalidProxyPortInput = (newPort) => {
  const params = { newPort };
  trackEvent(INVALID_PROXY_PORT_INPUT, params);
};

export const trackUserDeniedClosingLaunchedApps = () => {
  const params = {};
  trackEvent(USER_DENIED_CLOSING_LAUNCHED_APPS, params);
};

export const trackProxyPortChangeRequested = () => {
  const params = {};
  trackEvent(PROXY_PORT_CHANGE_REQUESTED, params);
};

export const trackTrafficInterceptionStarted = (app_name) => {
  const params = { app_name };
  trackEvent(TRAFFIC_TABLE.TRAFFIC_INTERCEPTION_STARTED, params);
};

export const trackTrafficTableRequestClicked = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_CLICKED);
};

export const trackTrafficTableRequestRightClicked = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_RIGHT_CLICKED);
};

export const trackTrafficTableDropdownClicked = (action) => {
  const params = { action };
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_DROPDOWN_CLICKED, params);
};

export const trackTrafficTableLogsCleared = (app_connected) => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_LOGS_CLEARED, { app_connected });
};

export const trackTrafficInterceptionPaused = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_INTERCEPTION_PAUSED);
};

export const trackTrafficInterceptionResumed = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_INTERCEPTION_RESUMED);
};

export const trackTrafficTableFilterClicked = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_FILTER_CLICKED);
};

export const trackTrafficTableSearched = () => {
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_SEARCHED);
};

export const trackTrafficTableFilterApplied = (filter_type, filter_value, count) => {
  const params = {
    filter_type,
    filter_value,
    count,
  };
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_FILTER_APPLIED, params);
};
