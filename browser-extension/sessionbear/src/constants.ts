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
  GET_IS_USER_LOGGED_IN: "getIsUserLoggedIn",
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
  VIEW_RECORDING: "viewRecording",
  IS_EXPLICIT_RECORDING_SESSION: "isExplicitRecordingSession",
  NOTIFY_RECORD_UPDATED_IN_POPUP: "notifyRecordUpdatedInPopup",
  NOTIFY_PAGE_LOADED_FROM_CACHE: "notifyPageLoadedFromCache",
  ON_BEFORE_AJAX_REQUEST_PROCESSED: "onBeforeAjaxRequest:processed",
  ON_ERROR_OCCURRED_PROCESSED: "onErrorOccurred:processed",
  START_EXPLICIT_RULE_TESTING: "startExplicitRuleTesting",
  START_IMPLICIT_RULE_TESTING: "startImplicitRuleTesting",
  SYNC_APPLIED_RULES: "syncAppliedRules",
  NOTIFY_RULE_EXECUTED: "notifyRuleExecuted",
};

export const STORAGE_TYPE = "local";

export const PUBLIC_NAMESPACE = "__REQUESTLY__";

export const STORAGE_KEYS = {
  LAST_SYNCED_TS: "last-synced-ts",
  LAST_UPDATED_TS: "last-updated-ts",
  TEST_REPORTS: "testReports",
  REFRESH_TOKEN: "refreshToken",
  ACTIVE_WORKSPACE_ID: "activeWorkspaceId",
};

export const LINKS = {
  REQUESTLY_EXTENSION_TROUBLESHOOTING:
    "https://docs.requestly.io/browser-extension/chrome/category/troubleshooting?source=popup",
};

export const CUSTOM_ELEMENTS = {
  DRAFT_SESSION_VIEWER: "rq-draft-session-viewer",
  POST_SESSION_SAVE_WIDGET: "rq-post-session-save-widget",
};

export const CLIENT_SOURCE = {
  SESSIONBEAR: "sessionbear:client",
};
