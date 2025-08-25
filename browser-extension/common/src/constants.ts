export const APP_MESSAGES = {
  GET_STORAGE_INFO: "GET_STORAGE_INFO",
  GET_STORAGE_SUPER_OBJECT: "GET_STORAGE_SUPER_OBJECT",
  GET_STORAGE_OBJECT: "GET_STORAGE_OBJECT",
  SAVE_STORAGE_OBJECT: "SAVE_STORAGE_OBJECT",
  REMOVE_STORAGE_OBJECT: "REMOVE_STORAGE_OBJECT",
  CLEAR_STORAGE: "CLEAR_STORAGE",
};

export const EXTENSION_MESSAGES = {
  GET_FULL_LOGS: "getFullLogs",
  CLEAR_LOGS_FOR_TAB: "clearLogsForTab",
  CLEAR_LOGS_FOR_DOMAIN: "clearLogsForDomain",
  GET_RULES_AND_GROUPS: "getRulesAndGroups",
  GET_TAB_SESSION: "getTabSession",
  HANDSHAKE_CLIENT: "handshakeClient",
  GET_API_RESPONSE: "getAPIResponse",
  GET_EXECUTED_RULES: "getExecutedRules",
  CHECK_IF_NO_RULES_PRESENT: "checkIfNoRulesPresent",
  START_RECORDING_EXPLICITLY: "startRecordingExplicitly",
  START_RECORDING_ON_URL: "startRecordingOnUrl",
  STOP_RECORDING: "stopRecording",
  WATCH_RECORDING: "watchRecording",
  CHECK_IF_EXTENSION_ENABLED: "checkIfExtensionEnabled",
  TOGGLE_EXTENSION_STATUS: "toggleExtensionStatus",
  CACHE_RECORDED_SESSION_ON_PAGE_UNLOAD: "cacheRecordedSessionOnPageUnload",
  INIT_SESSION_RECORDER: "initSessionRecorder",
  CLIENT_PAGE_LOADED: "clientPageLoaded",
  ON_BEFORE_AJAX_REQUEST: "onBeforeAjaxRequest",
  ON_ERROR_OCCURRED: "onErrorOccurred",
  SAVE_TEST_RULE_RESULT: "saveTestRuleResult",
  NOTIFY_TEST_RULE_REPORT_UPDATED: "notifyTestRuleReportUpdated",
  TEST_RULE_ON_URL: "testRuleOnUrl",
  RULE_EXECUTED: "ruleExecuted",
  NOTIFY_RECORD_UPDATED_IN_POPUP: "notifyRecordUpdatedInPopup",
  RULE_SAVE_ERROR: "ruleSaveError",
  IS_EXTENSION_BLOCKED_ON_TAB: "isExtensionBlockedOnTab",
  CACHE_SHARED_STATE: "cacheSharedState",
  IS_PROXY_APPLIED: "isProxyApplied",
  CHECK_IF_DESKTOP_APP_OPEN: "checkIfDesktopAppOpen",
  CONNECT_TO_DESKTOP_APP: "connectToDesktopApp",
  DISCONNECT_FROM_DESKTOP_APP: "disconnectFromDesktopApp",
  DESKTOP_APP_CONNECTION_STATUS_UPDATED: "desktopAppConnectionStatusUpdated",
  IS_SESSION_REPLAY_ENABLED: "isSessionReplayEnabled",
  TRIGGER_OPEN_CURL_MODAL: "triggerOpenCurlModal",
};

export const EXTENSION_EXTERNAL_MESSAGES = {
  GET_EXTENSION_METADATA: "getExtensionMetadata",
};

export const CLIENT_MESSAGES = {
  ADD_EVENT: "addEvent",
  ADD_EXECUTION_EVENT: "addExecutionEvent",
  INIT_SESSION_RECORDING: "initSessionRecording",
  NOTIFY_SESSION_RECORDING_STARTED: "notifySessionRecordingStarted",
  NOTIFY_SESSION_RECORDING_STOPPED: "notifySessionRecordingStopped",
  IS_RECORDING_SESSION: "isRecordingSession",
  GET_TAB_SESSION: "getTabSession",
  GET_APPLIED_RULES: "getAppliedRules",
  UPDATE_APPLIED_SCRIPT_RULES: "updateAppliedScriptRules",
  START_RECORDING: "startRecording",
  STOP_RECORDING: "stopRecording",
  IS_EXPLICIT_RECORDING_SESSION: "isExplicitRecordingSession",
  NOTIFY_PAGE_LOADED_FROM_CACHE: "notifyPageLoadedFromCache",
  ON_BEFORE_AJAX_REQUEST_PROCESSED: "onBeforeAjaxRequest:processed",
  ON_ERROR_OCCURRED_PROCESSED: "onErrorOccurred:processed",
  START_EXPLICIT_RULE_TESTING: "startExplicitRuleTesting",
  START_IMPLICIT_RULE_TESTING: "startImplicitRuleTesting",
  SYNC_APPLIED_RULES: "syncAppliedRules",
  NOTIFY_RULE_EXECUTED: "notifyRuleExecuted",
  NOTIFY_RECORD_UPDATED: "notifyRecordUpdated",
  NOTIFY_EXTENSION_STATUS_UPDATED: "notifyExtensionStatusUpdated",
  OPEN_CURL_IMPORT_MODAL: "openCurlImportModal",
};

export const STORAGE_TYPE = "local";

export const PUBLIC_NAMESPACE = "__REQUESTLY__";

export const RULE_TITLES = {
  REDIRECT: "Redirect request",
  CANCEL: "Cancel request",
  REPLACE: "Replace string",
  HEADERS: "Modify headers",
  USERAGENT: "User-agent",
  SCRIPT: "Insert scripts",
  QUERYPARAM: "Query param",
  RESPONSE: "Modify API response",
  REQUEST: "Modify request body",
  DELAY: "Delay network requests",
};

export const STORAGE_KEYS = {
  LAST_SYNCED_TS: "last-synced-ts",
  LAST_UPDATED_TS: "last-updated-ts",
  TEST_REPORTS: "testReports",
  IMPLICIT_RULE_TESTING_WIDGET_CONFIG: "implicit_rule_testing_widget_config",
  BLOCKED_DOMAINS: "blocked_domains",
  POPUP_CONFIG: "popup_config",
};

export const LINKS = {
  REQUESTLY_EXTENSION_TROUBLESHOOTING: "https://docs.requestly.com/guides/troubleshooting/rules-not-working",
};
