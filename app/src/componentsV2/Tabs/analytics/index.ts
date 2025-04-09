import { trackEvent } from "modules/analytics";
import { TAB_EVENTS } from "./constants";

export type ResetTabSource = "workspace_switch" | "sign_out";

export const trackTabOpenClicked = (sourceId: string, sourceName: string, previewMode: boolean) => {
  trackEvent(TAB_EVENTS.TAB_OPEN_CLICKED, { sourceId, sourceName, previewMode });
};

export const trackTabOpened = (sourceId: string, sourceName: string, previewMode: boolean) => {
  trackEvent(TAB_EVENTS.TAB_OPENED, { sourceId, sourceName, previewMode });
};

export const trackUpsertTabSourceCalled = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.UPSERT_TAB_SOURCE_CALLED, { sourceId, sourceName });
};

export const trackUpsertTabSourceCompleted = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.UPSERT_TAB_SOURCE_COMPLETED, { sourceId, sourceName });
};

export const trackTabCloseClicked = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSE_CLICKED, { sourceId, sourceName });
};

export const trackTabClosed = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSED, { sourceId, sourceName });
};

export const trackTabCloseById = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSE_BY_ID, { sourceId, sourceName });
};

export const trackTabClosedById = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.TAB_CLOSED_BY_ID, { sourceId, sourceName });
};

export const trackResetTabServiceStore = (source: ResetTabSource) => {
  trackEvent(TAB_EVENTS.RESET_TAB_SERVICE_STORE, { source });
};

export const trackTabActionEarlyReturn = (source: string, reason: string) => {
  trackEvent(TAB_EVENTS.TAB_ACTION_EARLY_RETURN, { source, reason });
};

export const trackTabsRehydrationStarted = () => {
  trackEvent(TAB_EVENTS.TABS_REHYDRATION_STARTED, {});
};

export const trackTabsRehydrationError = (error: string) => {
  trackEvent(TAB_EVENTS.TABS_REHYDRATION_ERROR, { error });
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

export const trackTabGenericStateSetTitle = (sourceId: string, sourceName: string) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_TITLE, { sourceId, sourceName });
};

export const trackTabGenericStateSetPreviewMode = (sourceId: string, sourceName: string, value: boolean) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_PREVIEW_MODE, { sourceId, sourceName, value });
};

export const trackTabGenericStateSetUnsaved = (sourceId: string, sourceName: string, value: boolean) => {
  trackEvent(TAB_EVENTS.TAB_GENERIC_STATE_SET_UNSAVED, { sourceId, sourceName, value });
};
