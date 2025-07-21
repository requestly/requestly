import { trackEvent } from "modules/analytics";
import { SHARED_LIST } from "./constants";

export const trackSharedListUrlCopied = (source: string, id: string, access_type?: string) => {
  const params = { source, id, access_type };
  trackEvent(SHARED_LIST.URL_COPIED, params);
};

export const trackSharedListDeleteClicked = (id: string) => {
  const params = { id };
  trackEvent(SHARED_LIST.DELETE_CLICKED, params);
};

export const trackSharedListImportNotificationStatusUpdated = (id: string, value: boolean) => {
  const params = { id, value };
  trackEvent(SHARED_LIST.IMPORT_NOTIFICATION_STATUS_UPDATED, params);
};
