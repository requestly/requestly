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
  GET_ALL_RULES: "getAllRules",
  GET_RULES_AND_GROUPS: "getRulesAndGroups",
  GET_TAB_SESSION: "getTabSession",
  HANDSHAKE_CLIENT: "handshakeClient",
  GET_EXECUTED_RULES: "getExecutedRules",
  GET_RECENT_RULES: "getRecentRules",
  CHECK_IF_NO_RULES_PRESENT: "checkIfNoRulesPresent",
  INIT_SESSION_RECORDING_WITH_NEW_CONFIG: "initSessionRecordingWithNewConfig",
  UPDATE_SESSION_RECORDING_CONFIG: "updateSessionRecordingConfig",
  CHECK_IF_RECORDING_CONFIG_PRESENT: "checkIfRecordingConfigPresent",
  CHECK_IF_EXTENSION_ENABLED: "checkIfExtensionEnabled",
  TOGGLE_EXTENSION_STATUS: "toggleExtensionStatus",
};

export const CLIENT_MESSAGES = {
  INIT_SESSION_RECORDING: "initSessionRecording",
  NOTIFY_SESSION_RECORDING_STARTED: "notifySessionRecordingStarted",
  IS_RECORDING_SESSION: "isRecordingSession",
  GET_TAB_SESSION: "getTabSession",
  GET_APPLIED_RESPONSE_RULES: "getAppliedResponseRules",
  GET_APPLIED_SCRIPT_RULES: "getAppliedScriptRules",
  UPDATE_APPLIED_SCRIPT_RULES: "updateAppliedScriptRules",
  START_RECORDING: "startRecording",
  STOP_RECORDING: "stopRecording",
  IS_EXPLICIT_RECORDING_SESSION: "isExplicitRecordingSession",
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
