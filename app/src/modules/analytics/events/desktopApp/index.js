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
  AUTH,
  UPDATE_DIALOG,
} from "./constants";
import { getUserOS } from "utils/osUtils";

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
  const detectedOS = getUserOS();
  const params = { detectedOS };
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

export const trackTrafficInterceptionStarted = (connectedApps) => {
  const params = { connectedApps };
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

export const trackSavingTooManyLogsAlertShown = (logsCount, src) => {
  const params = { logsCount, src };
  trackEvent(TRAFFIC_TABLE.TRAFFIC_TABLE_SAVING_EXCESS_LOGS_ALERT_SHOWN, params);
};

export const trackAuthRedirectedFromDesktopApp = () => {
  trackEvent(AUTH.REDIRECTED, {});
};

export const trackAuthRedirectUrlCopied = () => {
  trackEvent(AUTH.REDIRECT_URL_COPIED, {});
};

export const trackUpdateAvailable = () => {
  const params = { detectedOS: getUserOS() };
  trackEvent(UPDATE_DIALOG.UPDATE_AVAILABLE, params);
};

export const trackUpdateDownloadComplete = () => {
  const params = { detectedOS: getUserOS() };
  trackEvent(UPDATE_DIALOG.UPDATE_DONWLOADED, params);
};

export const trackTriggeredRedirectedToManuallyInstall = () => {
  const params = { detectedOS: getUserOS() };
  trackEvent(UPDATE_DIALOG.TRIGGERED_REDIRECT_FOR_MANUAL_INSTALL, params);
};

export const trackTriggerManualClickAndInstall = () => {
  const params = { detectedOS: getUserOS() };
  trackEvent(UPDATE_DIALOG.TRIGGERED_REDIRECT_FOR_MANUAL_INSTALL, params);
};
