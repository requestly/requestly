import { getAppDetails, isProductionUI } from "utils/AppUtils";
import sibIntegration from "./integrations/sendInBlue";
import crispIntegration from "./integrations/crisp";
import amplitudeIntegration from "./integrations/amplitude";
import firebaseIntegration from "./integrations/firebase";
import juneIntegration from "./integrations/june";
import localIntegration from "./integrations/local";
import clarityIntegration from "./integrations/clarity";
import oneFlowIntegration from "./integrations/oneflow";
import { SYNCING } from "./events/features/constants";
import Logger from "lib/logger";
import sentryIntegration from "./integrations/sentry";
import saturnIntegration from "./integrations/saturn";

// These are mostly not user-triggered
const BLACKLISTED_EVENTS = [
  SYNCING.SYNC.TRIGGERED,
  SYNCING.SYNC.COMPLETED,
  SYNCING.SYNC.FAILED,
  SYNCING.BACKUP.CREATED,
];

export const trackEvent = (name, params, eventConfig = {}) => {
  if (BLACKLISTED_EVENTS.includes(name)) return;

  Logger.log(`[analytics.trackEvent] name=${name} params=`, params);

  const { app_mode, app_version } = getAppDetails();

  // Add uid to every event
  const newParams = { ...params };
  newParams.uid = newParams?.uid ?? window?.uid ?? null;
  newParams.rq_app_mode = app_mode;
  newParams.rq_app_version = app_version;
  newParams.automation_enabled = window.navigator.webdriver === true;
  newParams.workspace = window.currentlyActiveWorkspaceTeamId
    ? "team"
    : "personal";
  newParams.workspaceId = window.currentlyActiveWorkspaceTeamId
    ? window.currentlyActiveWorkspaceTeamId
    : null;

  newParams.workspaceMembersCount = window.workspaceMembersCount ?? null;
  
  if (isProductionUI) {
    // Send to GA4
    if(window.gtag) {
      window.gtag("event", name, newParams);
    }

    amplitudeIntegration.trackEventWithConfig(name, newParams, eventConfig);
    juneIntegration.trackEvent(name, newParams);
    // crispIntegration.trackEvent(name, newParams);
    sibIntegration.trackEvent(name, newParams);
    oneFlowIntegration.trackEvent(name, newParams);
  } else {
    Logger.log("TRACK_EVENT:", name, newParams);
  }
};

export const trackAttr = (name, value) => {
  if (!isProductionUI) return;
  if (window.currentlyActiveWorkspaceTeamId) return;
  if (!name || value == null) return;

  name = name?.toLowerCase();
  Logger.log(`[analytics.trackAttr] name=${name} params=${value}`);

  firebaseIntegration.trackAttr(name, value);
  sibIntegration.trackAttr(name, value);
  // crispIntegration.trackAttr(name, value);
  amplitudeIntegration.trackAttr(name, value);
  juneIntegration.trackAttr(name, value);
  localIntegration.trackAttr(name, value);
  oneFlowIntegration.trackAttr(name, value);
};

export const initIntegrations = (user, dispatch) => {
  if (isProductionUI) {
    if (window.top === window.self) {
      firebaseIntegration.init(user);
      sibIntegration.init(user);
      crispIntegration.init(user);
      amplitudeIntegration.init(user);
      juneIntegration.init(user);
      clarityIntegration.init(user);
      localIntegration.init(null, dispatch);
      oneFlowIntegration.init(user);
      saturnIntegration.init(user);
    }
  }

  sentryIntegration.init(user);
};
