import { trackEvent } from "modules/analytics";
import { SYNCING } from "../constants";

export const trackSyncTriggered = (uid, records_count, syncType) => {
  const params = {
    uid,
    records_count,
    syncType,
  };
  trackEvent(SYNCING.SYNC.TRIGGERED, params);
};

export const trackSyncToggled = (uid, syncStatus) => {
  const params = {
    uid,
    syncStatus,
  };
  trackEvent(SYNCING.SYNC.TOGGLED, params);
};

export const trackSyncCompleted = (uid) => {
  const params = {
    uid,
  };
  trackEvent(SYNCING.SYNC.COMPLETED, params);
};

export const trackSyncFailed = (uid, syncType, error) => {
  const params = {
    uid,
    syncType,
    error,
  };
  trackEvent(SYNCING.SYNC.FAILED, params);
};
