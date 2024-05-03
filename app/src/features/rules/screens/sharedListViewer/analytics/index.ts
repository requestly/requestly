import { trackEvent } from "modules/analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { SHARED_LIST_VIEWER } from "./constants";

export const trackSharedListImportStartedEvent = (id: string, rules: number) => {
  const params = { id, rules };
  trackRQLastActivity(SHARED_LIST_VIEWER.IMPORT_STARTED);
  trackEvent(SHARED_LIST_VIEWER.IMPORT_STARTED, params);
};
export const trackSharedListImportFailed = (id: string, rules: number) => {
  const params = { id, rules };
  trackRQLastActivity(SHARED_LIST_VIEWER.IMPORT_FAILED);
  trackEvent(SHARED_LIST_VIEWER.IMPORT_FAILED, params);
};
export const trackSharedListImportCompleted = (id: string, rules: number) => {
  const params = { id, rules };
  trackRQLastActivity(SHARED_LIST_VIEWER.IMPORT_COMPLETED);
  trackEvent(SHARED_LIST_VIEWER.IMPORT_COMPLETED, params);
};
