import { trackEvent } from "modules/analytics";
import { TAB_EVENTS } from "./constants";

export const trackTabOpenClicked = (sourceId: string, sourceType: string, previewMode: boolean) => {
  trackEvent(TAB_EVENTS.TAB_OPEN_CLICKED, { sourceId, sourceType, previewMode });
};

export const trackTabOpened = (sourceId: string, sourceType: string, previewMode: boolean) => {
  trackEvent(TAB_EVENTS.TAB_OPENED, { sourceId, sourceType, previewMode });
};

export const trackTabCloseClicked = (sourceId: string, sourceType: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSE_CLICKED, { sourceId, sourceType });
};

export const trackTabClosed = (sourceId: string, sourceType: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSED, { sourceId, sourceType });
};

export const trackTabCloseById = (sourceId: string, sourceType: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSE_BY_ID, { sourceId, sourceType });
};

export const trackTabClosedById = (sourceId: string, sourceType: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSED_BY_ID, { sourceId, sourceType });
};

export const trackResetTabServiceStore = (source: "workspace_switch" | "sign_out") => {
  trackEvent(TAB_EVENTS.RESET_TAB_SERVICE_STORE, { source });
};

export const trackTabsRehydrationStarted = () => {
  trackEvent(TAB_EVENTS.TABS_REHYDRATION_STARTED, {});
};

export const trackTabsRehydrationCompleted = () => {
  trackEvent(TAB_EVENTS.TABS_REHYDRATION_COMPLETED, {});
};

export const trackTabLocalStorageSetItemCalled = () => {
  trackEvent(TAB_EVENTS.TABS_LOCAL_STORAGE_SET_ITEM_CALLED, {});
};

export const trackTabLocalStorageGetItemCalled = () => {
  trackEvent(TAB_EVENTS.TABS_LOCAL_STORAGE_GET_ITEM_CALLED, {});
};

export const trackTabGenericStateSetTitle = (sourceId: string, sourceType: string) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_TITLE, { sourceId, sourceType });
};

export const trackTabGenericStateSetPreviewMode = (sourceId: string, sourceType: string, value: boolean) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_PREVIEW_MODE, { sourceId, sourceType, value });
};

export const trackTabGenericStateSetSaved = (sourceId: string, sourceType: string, value: boolean) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_SAVED, { sourceId, sourceType, value });
};
