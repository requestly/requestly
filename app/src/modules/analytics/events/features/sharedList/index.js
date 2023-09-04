import { trackEvent } from "modules/analytics";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { SHARED_LIST } from "../constants";

export const trackSharedListCreatedEvent = (
  id,
  name,
  num_rules,
  source,
  access_type,
  non_rq_users,
  num_users_notified
) => {
  const params = {
    id,
    name,
    num_rules,
    source,
    access_type,
  };

  if (num_users_notified) params.num_users_notified = num_users_notified;
  if (non_rq_users) params.non_rq_users = non_rq_users;

  trackEvent(SHARED_LIST.CREATED, params);
};

export const trackSharedListLimitReachedEvent = (num) => {
  const params = { num };
  trackEvent(SHARED_LIST.LIMIT_REACHED, params);
};

export const trackSharedListImportStartedEvent = (id) => {
  const params = { id };
  trackRQLastActivity(SHARED_LIST.IMPORT_STARTED);
  trackEvent(SHARED_LIST.IMPORT_STARTED, params);
};
export const trackSharedListImportFailed = (id) => {
  const params = { id };
  trackRQLastActivity(SHARED_LIST.IMPORT_FAILED);
  trackEvent(SHARED_LIST.IMPORT_FAILED, params);
};
export const trackSharedListImportCompleted = (id) => {
  const params = { id };
  trackRQLastActivity(SHARED_LIST.IMPORT_COMPLETED);
  trackEvent(SHARED_LIST.IMPORT_COMPLETED, params); // add session id
};

export const trackSharedListUrlCopied = (source, id, access_type) => {
  const params = { source, id, access_type };
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

export const trackSharedListVisibilityToggled = (visibility) => {
  const params = { visibility };
  trackEvent(SHARED_LIST.VISIBILITY_TOGGLED, params);
};
export const trackSharedListRecipientAdded = () => {
  trackEvent(SHARED_LIST.RECIPIENT_ADDED);
};
