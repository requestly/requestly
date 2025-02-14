import { trackEvent } from "modules/analytics";
import { API_CLIENT } from "../constants";

// Request
export const trackAPIRequestSent = (params = {}) => {
  trackEvent(API_CLIENT.REQUEST_SENT, params);
};

export const trackRequestRenamed = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.REQUEST_RENAMED, params);
};

export const trackNewRequestClicked = (src) => {
  const params = { src };
  trackEvent(API_CLIENT.NEW_REQUEST_CLICKED, params);
};

export const trackRequestSaved = (params) => {
  trackEvent(API_CLIENT.REQUEST_SAVED, params);
};

export const trackRequestFailed = (reason) => {
  trackEvent(API_CLIENT.REQUEST_FAILED, { reason });
};

export const trackRequestDeleted = () => {
  trackEvent(API_CLIENT.REQUEST_DELETED);
};

export const trackRequestDuplicated = () => {
  trackEvent(API_CLIENT.REQUEST_DUPLICATED);
};

export const trackRequestExported = () => {
  trackEvent(API_CLIENT.REQUEST_EXPORTED);
};

export const trackRequestMoved = (collectionType) => {
  trackEvent(API_CLIENT.REQUEST_MOVED, { collectionType });
};

export const trackRequestCurlCopied = () => {
  trackEvent(API_CLIENT.REQUEST_CODE_COPIED);
};

export const trackAPIRequestCancelled = () => {
  trackEvent(API_CLIENT.REQUEST_CANCELLED);
};

// Tab
export const trackNewTabOpened = () => {
  trackEvent(API_CLIENT.NEW_TAB_OPENED);
};

// Collection
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
  trackEvent(API_CLIENT.COLLECTION_EXPORTED);
};

// Environment & Variables
export const trackEnvironmentClicked = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_CLICKED);
};

export const trackVariablesUpdated = (params) => {
  trackEvent(API_CLIENT.VARIABLES_UPDATED, params);
};

export const trackEnvironmentSwitched = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_SWITCHED);
};

export const trackEnvironmentRenamed = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_RENAMED);
};

export const trackEnvironmentDuplicated = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_DUPLICATED);
};

export const trackEnvironmentExported = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_EXPORTED);
};

export const trackEnvironmentDeleted = () => {
  trackEvent(API_CLIENT.ENVIRONMENT_DELETED);
};

// Import data
export const trackImportStarted = (type) => {
  trackEvent(API_CLIENT.IMPORT_STARTED, { import_type: type });
};

export const trackImportParsed = (type, collectionsCount, requestsCount) => {
  trackEvent(API_CLIENT.IMPORT_DATA_PARSED, {
    import_type: type,
    request_count: requestsCount,
    collection_count: collectionsCount,
  });
};

export const trackImportParseFailed = (type, requestCount, collectionCount) => {
  trackEvent(API_CLIENT.IMPORT_DATA_FAILED, {
    import_type: type,
    request_count: requestCount,
    collection_count: collectionCount,
  });
};

export const trackImportSuccess = (type, recordsCount) => {
  trackEvent(API_CLIENT.IMPORT_SUCCESS, {
    import_type: type,
    collection_count: recordsCount,
    request_count: recordsCount.length,
  });
};

export const trackImportFailed = (type, reason) => {
  trackEvent(API_CLIENT.IMPORT_FAILED, { import_type: type, reason });
};

// -------------------------------------------------//
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

export const trackRequestSelectedFromHistory = () => {
  trackEvent(API_CLIENT.REQUEST_SELECTED_FROM_HISTORY);
};

export const trackHistoryCleared = () => {
  trackEvent(API_CLIENT.HISTORY_CLEARED);
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

export const trackImportFromBrunoClicked = () => {
  trackEvent(API_CLIENT.IMPORT_FROM_BRUNO_CLICKED);
};

export const trackImportFromBrunoCompleted = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_BRUNO_COMPLETED, { num_collections, num_environments });
};

export const trackImportFromBrunoFailed = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_BRUNO_FAILED, { num_collections, num_environments });
};

export const trackImportFromBrunoDataProcessed = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_BRUNO_DATA_PROCESSED, { num_collections, num_environments });
};

export const trackImportFromBrunoStarted = (num_collections, num_environments) => {
  trackEvent(API_CLIENT.IMPORT_FROM_BRUNO_STARTED, { num_collections, num_environments });
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
