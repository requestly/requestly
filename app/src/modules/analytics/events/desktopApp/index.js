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
