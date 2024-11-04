import { trackEvent } from "modules/analytics";
import { API_CLIENT } from "../constants";

export const trackAPIRequestSent = (params = {}) => {
  trackEvent(API_CLIENT.REQUEST_SENT, params);
};

export const trackAPIRequestCancelled = () => {
  trackEvent(API_CLIENT.REQUEST_CANCELLED);
};

export const trackBeautifyRequestJSONClicked = () => {
  trackEvent(API_CLIENT.BEAUTIFY_REQUEST_JSON_CLICKED);
};

export const trackImportCurlClicked = () => {
  trackEvent(API_CLIENT.IMPORT_CURL_CLICKED);
};

export const trackCurlImported = () => {
  trackEvent(API_CLIENT.CURL_IMPORTED);
};

export const trackCurlImportFailed = () => {
  trackEvent(API_CLIENT.CURL_IMPORT_FAILED);
};

export const trackNewRequestClicked = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.NEW_REQUEST_CLICKED, params);
};

export const trackRequestSelectedFromHistory = () => {
  trackEvent(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
};

export const trackHistoryCleared = () => {
  trackEvent(API_CLIENT.HISTORY_CLEARED);
};

export const trackRequestFailed = () => {
  trackEvent(API_CLIENT.REQUEST_FAILED);
};

export const trackResponseLoaded = (params = {}) => {
  trackEvent(API_CLIENT.RESPONSE_LOADED, params);
};

export const trackRawResponseViewed = () => {
  trackEvent(API_CLIENT.RAW_RESPONSE_VIEWED);
};

export const trackResponseHeadersViewed = () => {
  trackEvent(API_CLIENT.RESPONSE_HEADERS_VIEWED);
};

export const trackInstallExtensionDialogShown = (params) =>
  trackEvent(API_CLIENT.INSTALL_EXTENSION_DIALOG_SHOWN, params);

export const trackRequestSaved = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.REQUEST_SAVED, params);
};

export const trackRequestRenamed = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.REQUEST_RENAMED, params);
};

export const trackNewCollectionClicked = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.NEW_COLLECTION_CLICKED, params);
};

export const trackCollectionSaved = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.COLLECTION_SAVED, params);
};

export const trackCollectionRenamed = () => {
  trackEvent(API_CLIENT.COLLECTION_RENAMED);
};

export const trackCollectionDeleted = () => {
  trackEvent(API_CLIENT.COLLECTION_DELETED);
};
