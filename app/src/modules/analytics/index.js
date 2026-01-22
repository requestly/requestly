import { getAppDetails } from "utils/AppUtils";
import { SYNCING } from "./events/features/constants";
import Logger from "lib/logger";
import posthogIntegration from "./integrations/posthog";
import localIntegration from "./integrations/local";
import { isEnvAutomation } from "utils/EnvUtils";
import { WorkspaceType } from "features/workspaces/types";

// These are mostly not user-triggered
const BLACKLISTED_EVENTS = [
  SYNCING.SYNC.TRIGGERED,
  SYNCING.SYNC.COMPLETED,
  SYNCING.SYNC.FAILED,
  SYNCING.BACKUP.CREATED,
];

const getWorkspaceType = () => {
  if (window.currentlyActiveWorkspaceType) {
    switch (window.currentlyActiveWorkspaceType) {
      case WorkspaceType.LOCAL:
        return "local";
      case WorkspaceType.SHARED:
        return "team";
      case WorkspaceType.PERSONAL:
        return "personal";
      default:
        return "personal";
    }
  }
  return window.currentlyActiveWorkspaceTeamId ? "team" : "personal";
};

export const trackEvent = (name, params, config) => {
  if (BLACKLISTED_EVENTS.includes(name)) return;
  if (localStorage.getItem("dataCollectionStatus") && localStorage.getItem("dataCollectionStatus") === "disabled")
    return;

  const { app_mode, app_version } = getAppDetails();

  // Add uid to every event
  const newParams = { ...params };
  newParams.rq_app_mode = app_mode;
  newParams.rq_app_version = app_version;
  newParams.automation_enabled = isEnvAutomation();
  newParams.workspace_role = window.currentlyActiveWorkspaceTeamRole ?? null;
  newParams.workspace = getWorkspaceType();
  newParams.workspaceId = window.currentlyActiveWorkspaceTeamId ? window.currentlyActiveWorkspaceTeamId : null;
  newParams.workspaceMembersCount = window.workspaceMembersCount ?? null;

  Logger.log(`[analytics.trackEvent] name=${name}`, { params, config });
  console.log("Temp event log", name, newParams);
  posthogIntegration.trackEvent(name, newParams);
};

export const trackAttr = (name, value) => {
  if (!name) return;
  if (localStorage.getItem("dataCollectionStatus") && localStorage.getItem("dataCollectionStatus") === "disabled")
    return;

  name = name?.toLowerCase();
  Logger.log(`[analytics.trackAttr] name=${name} params=${value}`);

  posthogIntegration.trackAttr(name, value);
  localIntegration.trackAttr(name, value);
};

export const initIntegrations = (user, dispatch) => {
  if (localStorage.getItem("dataCollectionStatus") && localStorage.getItem("dataCollectionStatus") === "disabled")
    return;

  if (window.top === window.self) {
    posthogIntegration.init(user);
    localIntegration.init(null, dispatch);
  }
};
