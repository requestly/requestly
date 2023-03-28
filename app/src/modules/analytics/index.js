import { getAppDetails } from "utils/AppUtils";
import { SYNCING } from "./events/features/constants";
import Logger from "lib/logger";
import posthogIntegration from "./integrations/posthog";
import localIntegration from "./integrations/local";

// These are mostly not user-triggered
const BLACKLISTED_EVENTS = [
  SYNCING.SYNC.TRIGGERED,
  SYNCING.SYNC.COMPLETED,
  SYNCING.SYNC.FAILED,
  SYNCING.BACKUP.CREATED,
];

export const trackEvent = (name, params) => {
  if (BLACKLISTED_EVENTS.includes(name)) return;
  if (
    localStorage.getItem("dataCollectionStatus") &&
    localStorage.getItem("dataCollectionStatus") === "disabled"
  )
    return;

  const { app_mode, app_version } = getAppDetails();

  // Add uid to every event
  const newParams = { ...params };
  newParams.rq_app_mode = app_mode;
  newParams.rq_app_version = app_version;
  newParams.automation_enabled = window.navigator.webdriver === true;
  newParams.workspace = window.currentlyActiveWorkspaceTeamId
    ? "team"
    : "personal";
  newParams.workspaceId = window.currentlyActiveWorkspaceTeamId
    ? window.currentlyActiveWorkspaceTeamId
    : null;

  Logger.log(`[analytics.trackEvent] name=${name} params=`, params);
  posthogIntegration.trackEvent(name, newParams);
};

export const trackAttr = (name, value) => {
  if (!name || !value) return;
  if (
    localStorage.getItem("dataCollectionStatus") &&
    localStorage.getItem("dataCollectionStatus") === "disabled"
  )
    return;

  name = name?.toLowerCase();
  Logger.log(`[analytics.trackAttr] name=${name} params=${value}`);

  posthogIntegration.trackAttr(name, value);
  localIntegration.trackAttr(name, value);
};

export const initIntegrations = (user, dispatch) => {
  if (
    localStorage.getItem("dataCollectionStatus") &&
    localStorage.getItem("dataCollectionStatus") === "disabled"
  )
    return;

  if (window.top === window.self) {
    posthogIntegration.init(user);
    localIntegration.init(null, dispatch);
  }
};
