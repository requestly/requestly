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

export const trackExportCollectionsClicked = () => {
  trackEvent(API_CLIENT.EXPORT_COLLECTIONS_CLICKED);
};

export const trackExportApiCollectionsStarted = (num_records, num_variables) => {
  trackEvent(API_CLIENT.EXPORT_COLLECTIONS_STARTED, { num_records, num_variables });
};

export const trackExportApiCollectionsFailed = (num_records, num_variables) => {
  trackEvent(API_CLIENT.EXPORT_COLLECTIONS_FAILED, { num_records, num_variables });
};

export const trackExportApiCollectionsSuccessful = (num_records, num_variables) => {
  trackEvent(API_CLIENT.EXPORT_COLLECTIONS_SUCCESSFUL, { num_records, num_variables });
};

export const trackImportApiCollectionsClicked = () => {
  trackEvent(API_CLIENT.IMPORT_COLLECTIONS_CLICKED);
};

export const trackImportApiCollectionsStarted = (num_records, num_variables) => {
  trackEvent(API_CLIENT.IMPORT_COLLECTIONS_STARTED, { num_records, num_variables });
};

export const trackImportApiCollectionsFailed = (num_records, num_variables) => {
  trackEvent(API_CLIENT.IMPORT_COLLECTIONS_FAILED, { num_records, num_variables });
};

export const trackImportApiCollectionsSuccessful = (num_records, num_variables) => {
  trackEvent(API_CLIENT.IMPORT_COLLECTIONS_SUCCESSFUL, { num_records, num_variables });
};

export const trackEnableKeyValueToggled = (is_active, type) => {
  trackEvent(API_CLIENT.ENABLE_KEY_VALUE_TOGGLED, { is_active, type });
};

export const trackImportFromPostmanClicked = () => {
  trackEvent(API_CLIENT.IMPORT_FROM_POSTMAN_CLICKED);
};

export const trackImportFromPostmanCompleted = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_POSTMAN_COMPLETED, { num_collections, num_environments });
};

export const trackImportFromPostmanFailed = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_POSTMAN_FAILED, { num_collections, num_environments });
};

export const trackImportFromPostmanDataProcessed = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_POSTMAN_DATA_PROCESSED, { num_collections, num_environments });
};

export const trackImportFromPostmanStarted = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_POSTMAN_STARTED, { num_collections, num_environments });
};

export const trackDuplicateRequestClicked = () => {
  trackEvent(API_CLIENT.DUPLICATE_REQUEST_CLICKED);
};

export const trackDuplicateRequestSuccessful = () => {
  trackEvent(API_CLIENT.DUPLICATE_REQUEST_SUCCESSFUL);
};

export const trackDuplicateRequestFailed = () => {
  trackEvent(API_CLIENT.DUPLICATE_REQUEST_FAILED);
};

export const trackMoveRequestToCollectionClicked = () => {
  trackEvent(API_CLIENT.MOVE_REQUEST_TO_COLLECTION_CLICKED);
};

export const trackMoveRequestToCollectionSuccessful = (destination) => {
  trackEvent(API_CLIENT.MOVE_REQUEST_TO_COLLECTION_SUCCESSFUL, { destination });
};

export const trackMoveRequestToCollectionFailed = (destination) => {
  trackEvent(API_CLIENT.MOVE_REQUEST_TO_COLLECTION_FAILED, { destination });
};
