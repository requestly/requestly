import { trackEvent } from "modules/analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { SHARED_LIST } from "../constants";

export const trackSharedListCreatedEvent = (num_rules, source, page) => {
  const params = {
    num_rules,
    source,
    page,
  };
  trackEvent(SHARED_LIST.CREATED, params);
};

export const trackSharedListLimitReachedEvent = (num) => {
  const params = { num };
  trackEvent(SHARED_LIST.LIMIT_REACHED, params);
};

export const trackSharedListImportStartedEvent = () => {
  const params = {};
  trackRQLastActivity(SHARED_LIST.IMPORT_STARTED);
  trackEvent(SHARED_LIST.IMPORT_STARTED, params);
};
export const trackSharedListImportFailed = () => {
  const params = {};
  trackRQLastActivity(SHARED_LIST.IMPORT_FAILED);
  trackEvent(SHARED_LIST.IMPORT_FAILED, params);
};
export const trackSharedListImportCompleted = () => {
  const params = {};
  trackRQLastActivity(SHARED_LIST.IMPORT_COMPLETED);
  trackEvent(SHARED_LIST.IMPORT_COMPLETED, params);
};

export const trackSharedListUrlCopied = (source) => {
  const params = { source };
  trackEvent(SHARED_LIST.URL_COPIED, params);
};

export const trackSharedListNotifyClicked = () => {
  const params = {};
  trackEvent(SHARED_LIST.NOTIFY_CLICKED, params);
};

export const trackSharedListDeleteClicked = (id) => {
  const params = { id };
  trackEvent(SHARED_LIST.DELETE_CLICKED, params);
};
