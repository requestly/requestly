import { trackEvent } from "modules/analytics";
import { API_CLIENT } from "../constants";

// Example collections
// TODO: To be removed once analysis done
export const trackExampleCollectionsImported = (params = {}) => {
  trackEvent(API_CLIENT.EXAMPLE_COLLECTIONS_IMPORTED, params);
};

export const trackExampleCollectionsImportFailed = (params = {}) => {
  trackEvent(API_CLIENT.EXAMPLE_COLLECTIONS_IMPORT_FAILED, params);
};

export const trackExampleCollectionsNudgeShown = (params = {}) => {
  trackEvent(API_CLIENT.EXAMPLE_COLLECTIONS_NUDGE_SHOWN, params);
};

export const trackExampleCollectionsNudgeCloseClicked = (params = {}) => {
  trackEvent(API_CLIENT.EXAMPLE_COLLECTIONS_NUDGE_CLOSE_CLICKED, params);
};

export const trackExampleCollectionsNudgeImportClicked = (params = {}) => {
  trackEvent(API_CLIENT.EXAMPLE_COLLECTIONS_NUDGE_IMPORT_CLICKED, params);
};

// Local store sync
export const trackLocalStorageSyncStarted = (params = {}) => {
  trackEvent(API_CLIENT.LOCAL_STORAGE_SYNC_STARTED, params);
};

export const trackLocalStorageSyncFailed = (params = {}) => {
  trackEvent(API_CLIENT.LOCAL_STORAGE_SYNC_FAILED, params);
};

export const trackLocalStorageSyncCompleted = (params = {}) => {
  trackEvent(API_CLIENT.LOCAL_STORAGE_SYNC_COMPLETED, params);
};

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

export const trackRequestFailed = (reason, errorType, url, method, status) => {
  trackEvent(API_CLIENT.REQUEST_FAILED, { reason, errorType, url, method, status });
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

export const trackRequestCurlCopied = (language) => {
  trackEvent(API_CLIENT.REQUEST_CODE_COPIED, { language });
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

export const trackCollectionDeleted = (type) => {
  trackEvent(API_CLIENT.COLLECTION_DELETED, { type });
};

export const trackExportCollectionsClicked = () => {
  trackEvent(API_CLIENT.COLLECTION_EXPORTED);
};

// Environment & Variables
export const trackNewEnvironmentClicked = (source) => {
  trackEvent(API_CLIENT.ENVIRONMENT_CLICKED, { source });
};

export const trackVariablesSaved = (params) => {
  trackEvent(API_CLIENT.VARIABLES_UPDATED, params);
};

export const trackVariableCreated = (params) => {
  trackEvent(API_CLIENT.VARIABLE_CREATED, params);
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
export const trackCurlImportModalOpened = (params = {}) => {
  trackEvent(API_CLIENT.CURL_IMPORT_MODAL_OPENED, params);
};

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

export const trackImportParseFailed = (type, reason) => {
  trackEvent(API_CLIENT.IMPORT_DATA_FAILED, {
    import_type: type,
    reason,
  });
};

export const trackImportSuccess = (type, collectionsCount, requestsCount) => {
  trackEvent(API_CLIENT.IMPORT_SUCCESS, {
    import_type: type,
    collection_count: collectionsCount,
    request_count: requestsCount,
  });
};

export const trackImportFailed = (type, reason) => {
  trackEvent(API_CLIENT.IMPORT_FAILED, { import_type: type, reason });
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

export const trackApiRequestDone = (params = {}) => {
  trackEvent(API_CLIENT.REQUEST_DONE, params);
};

export const trackRawResponseViewed = () => {
  trackEvent(API_CLIENT.RAW_RESPONSE_VIEWED);
};

export const trackInstallExtensionDialogShown = (params) =>
  trackEvent(API_CLIENT.INSTALL_EXTENSION_DIALOG_SHOWN, params);

export const trackExportApiCollectionsFailed = (num_records, num_variables) => {
  trackEvent(API_CLIENT.EXPORT_COLLECTIONS_FAILED, { num_records, num_variables });
};

export const trackDuplicateRequestClicked = () => {
  trackEvent(API_CLIENT.DUPLICATE_REQUEST_CLICKED);
};

export const trackDuplicateRequestFailed = () => {
  trackEvent(API_CLIENT.DUPLICATE_REQUEST_FAILED);
};

export const trackMoveRequestToCollectionClicked = () => {
  trackEvent(API_CLIENT.MOVE_REQUEST_TO_COLLECTION_CLICKED);
};

export const trackMoveRequestToCollectionFailed = (destination) => {
  trackEvent(API_CLIENT.MOVE_REQUEST_TO_COLLECTION_FAILED, { destination });
};

// Collection Runner
export const trackCollectionRunStarted = (params) => {
  const { request_count, iteration_count, delay, collection_id } = params;
  trackEvent(API_CLIENT.COLLECTION_RUN_STARTED, { request_count, iteration_count, delay, collection_id });
};

export const trackCollectionRunStopped = (params) => {
  const { request_count, iteration_count, delay, collection_id } = params;
  trackEvent(API_CLIENT.COLLECTION_RUN_STOPPED, { request_count, iteration_count, delay, collection_id });
};

export const trackCollectionRunnerViewed = (params) => {
  const { collection_id, source } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_VIEWED, { collection_id, source });
};

export const trackCollectionRunHistoryViewed = (params) => {
  const { collection_id } = params;
  trackEvent(API_CLIENT.COLLECTION_RUN_HISTORY_VIEWED, { collection_id });
};

export const trackCollectionRunSaveHistoryFailed = (params) => {
  const { collection_id } = params;
  trackEvent(API_CLIENT.COLLECTION_RUN_SAVE_HISTORY_FAILED, { collection_id });
};

export const trackCollectionRunnerConfigSaved = (params) => {
  const { collection_id, request_count, iteration_count, delay } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_CONFIG_SAVED, { collection_id, request_count, iteration_count, delay });
};

export const trackCollectionRunnerConfigSaveFailed = (params) => {
  const { collection_id, request_count, iteration_count, delay } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_CONFIG_SAVE_FAILED, { collection_id, request_count, iteration_count, delay });
};

// Tests Autogeneration

export const trackTestGenerationStarted = (params = {}) => {
  trackEvent(API_CLIENT.TEST_GENERATION_STARTED, params);
};

export const trackTestGenerationCompleted = (params = {}) => {
  trackEvent(API_CLIENT.TEST_GENERATION_COMPLETED, params);
};

export const trackTestGenerationFailed = (params = {}) => {
  trackEvent(API_CLIENT.TEST_GENERATION_FAILED, params);
};

// Data-File Support for Collection Runner
export const trackCollectionRunnerSelectFileClicked = (params) => {
  trackEvent(API_CLIENT.COLLECTION_RUNNER_SELECT_FILE_CLICKED, params);
};

export const trackCollectionRunnerFileParsed = (params) => {
  const { record_count, format } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_FILE_PARSED, { record_count, format });
};

export const trackCollectionRunnerFileParseFailed = (params) => {
  const { reason, format } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_FILE_PARSE_FAILED, { reason, format });
};

export const trackCollectionRunnerRecordLimitExceeded = (params) => {
  const { record_count } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_FILE_RECORD_LIMIT_EXCEEDED, { record_count });
};

export const trackCollectionRunnerTruncatedFileUsed = (params) => {
  const { record_count } = params;
  trackEvent(API_CLIENT.COLLECTION_RUNNER_TRUNCATED_FILE_USED, { record_count });
};

export const trackCollectionRunnerFileCleared = (params) => {
  trackEvent(API_CLIENT.COLLECTION_RUNNER_FILE_CLEARED, params);
};

export const trackGenerateTestBtnClicked = (session_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_BTN_CLICKED, { session_id });
};

export const trackPopoverGenerateTestsClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_POPOVER_GENERATE_CLICKED, { session_id, generation_id });
};

export const trackAITestGenerationFailed = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_FAILED, { session_id, generation_id });
};

export const trackAITestGenerationSuccessful = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_SUCCESSFUL, { session_id, generation_id });
};

export const trackAITestGenerationEditPromptClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_EDIT_PROMPT_CLICKED, { session_id, generation_id });
};

export const trackAITestGenerationRejectAllClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_REJECT_ALL_CLICKED, { session_id, generation_id });
};

export const trackAITestGenerationAcceptAllClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_ACCEPT_ALL_CLICKED, { session_id, generation_id });
};

export const trackAITestGenerationAcceptClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_ACCEPT_CLICKED, { session_id, generation_id });
};

export const trackAITestGenerationRejectClicked = (session_id, generation_id) => {
  trackEvent(API_CLIENT.AI_GENERATE_TESTS_REJECT_CLICKED, { session_id, generation_id });
};
