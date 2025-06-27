import FEATURES from "./sub/features";
import LINKS from "./sub/links";
import PATHS from "./sub/paths";
import MARKETPLACE_TABLE_CONSTANTS from "./sub/marketplace-table-constants";
import RULE_EDITOR_CONFIG from "./sub/rule-editor";
import RULE_TYPES_CONFIG from "./sub/rule-types";
import RULES_LIST_TABLE_CONSTANTS from "./sub/rules-list-table-constants";
import MOCK_TYPES_CONFIG from "./sub/mock-types";
import { STATUS_CODE_OPTIONS } from "./sub/statusCode";
import { CONTENT_TYPE_OPTIONS } from "./sub/contentType";
import { METHOD_TYPE_OPTIONS } from "./sub/methodType";
import SHARED_LISTS_TABLE_CONSTANTS from "./sub/shared-lists-table-constants";
import FILES_TABLE_CONSTANTS from "./sub/files-table-constants";
import THEME_COLORS from "./sub/theme-colors";
import AUTH from "./sub/auth";
import LIMIT_REACHED_MODAL from "./sub/limit-reached-modal";
import STYLES from "./sub/styles";
import COOKIES from "./sub/cookies";
import THEMES from "./sub/themes";
import HEADER_SUGGESTIONS from "./sub/header-suggestions";
import TEAM_WORKSPACES from "./sub/team-workspaces";
import { GA_EVENTS } from "./sub/analytics";
import STORAGE from "./sub/storage";

const APP_CONSTANTS = {};

/** FEATURES */
APP_CONSTANTS.FEATURES = FEATURES;

/** STORAGE KEYS */
APP_CONSTANTS.LAST_BACKUP_TIMESTAMP = "last-backup-timestamp";
APP_CONSTANTS.LAST_SYNC_TARGET = "last-sync-target";
APP_CONSTANTS.LAST_SYNCED_TS = "last-synced-ts";
APP_CONSTANTS.LAST_UPDATED_TS = "last-updated-ts";

APP_CONSTANTS.RQ_SETTINGS = "rq_settings";
APP_CONSTANTS.MIGRATED_HEADER_RULES_TO_V2 = "migrated-header-rules-to-v2";

/** EXTERNAL LINKS */
APP_CONSTANTS.LINKS = LINKS;

/** CUSTOM STYLES */
APP_CONSTANTS.STYLES = STYLES;

/** APP THEME */
APP_CONSTANTS.THEMES = THEMES;

/** CONFIG FOR RULE EDITOR */
APP_CONSTANTS.RULE_EDITOR_CONFIG = RULE_EDITOR_CONFIG;

/** PATHS */
APP_CONSTANTS.PATHS = PATHS;

/** RULE TYPES CONFIG */
APP_CONSTANTS.RULE_TYPES_CONFIG = RULE_TYPES_CONFIG;

/** CONFIG FOR RULE LIST TABLE */
APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS = RULES_LIST_TABLE_CONSTANTS;

/** MOCK TYPES CONFIG */
APP_CONSTANTS.MOCK_TYPES_CONFIG = MOCK_TYPES_CONFIG;
APP_CONSTANTS.STATUS_CODE = STATUS_CODE_OPTIONS;
APP_CONSTANTS.CONTENT_TYPE = CONTENT_TYPE_OPTIONS;
APP_CONSTANTS.METHOD_TYPE = METHOD_TYPE_OPTIONS;

/** CONFIG FOR SHARED LISTS TABLE */
APP_CONSTANTS.SHARED_LISTS_TABLE_CONSTANTS = SHARED_LISTS_TABLE_CONSTANTS;

/**  CONFIG FOR MARKETPLACE TABLE */
APP_CONSTANTS.MARKETPLACE_TABLE_CONSTANTS = MARKETPLACE_TABLE_CONSTANTS;

/** CONFIG FOR FILES TABLE */
APP_CONSTANTS.FILES_TABLE_CONSTANTS = FILES_TABLE_CONSTANTS;

/** GLOBAL THEME COLORS */
APP_CONSTANTS.THEME_COLORS = THEME_COLORS;

/** AUTHENTICATION */
APP_CONSTANTS.AUTH = AUTH;

/** LIMIT REACHED MODAL */
APP_CONSTANTS.LIMIT_REACHED_MODAL = LIMIT_REACHED_MODAL;

//MISC
APP_CONSTANTS.NOTIFICATION_DURATION = 2000;
APP_CONSTANTS.DELAY_COMPATIBILITY_VERSION = "21.6.4";
APP_CONSTANTS.EXECUTION_LOGS_COMPATIBILITY_VERSION = "21.11.16";
APP_CONSTANTS.SESSION_RECORDING_COMPATIBILITY_VERSION = "22.6.9";
APP_CONSTANTS.MOCK_RESPONSE_BODY_CHARACTER_LIMIT = 800000;
APP_CONSTANTS.TRASH_DURATION_OF_DELETED_RULES_TO_SHOW = 30;
APP_CONSTANTS.BETA = "beta";
APP_CONSTANTS.LOCAL = "local";
APP_CONSTANTS.PROD = "prod";

//List of known headers used for suggestion
APP_CONSTANTS.HEADER_SUGGESTIONS = HEADER_SUGGESTIONS;

// Trial Mode related
//List of countries to implement free trial- Brazil, France, Japan, Canada
APP_CONSTANTS.FREE_TRIAL_COUNTRIES = [];
APP_CONSTANTS.TRIAL_MODE_START_DATE = "2022-02-28";

// COOKIES
APP_CONSTANTS.COOKIES = COOKIES;

APP_CONSTANTS.PROD_RULES_URL = "https://app.requestly.io/rules";

APP_CONSTANTS.TEAM_WORKSPACES = TEAM_WORKSPACES;

APP_CONSTANTS.STORAGE = STORAGE;

// Moved from global constants
APP_CONSTANTS.SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELLED: "canceled",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
};

APP_CONSTANTS.PATH_FROM_PAIR = {
  SOURCE: "source",
  RULE_KEYS: "source.key",
  RULE_OPERATORS: "source.operator",
  RULE_VALUE: "source.value",
  SCRIPT_LIBRARIES: "libraries",
  SOURCE_PAGE_URL_OPERATOR: "source.filters.pageUrl.operator",
  SOURCE_PAGE_URL_VALUE: "source.filters.pageUrl.value",
  SOURCE_RESOURCE_TYPE: "source.filters.resourceType",
  SOURCE_REQUEST_METHOD: "source.filters.requestMethod",
  SOURCE_REQUEST_PAYLOAD: "source.filters.requestPayload",
  SOURCE_REQUEST_PAYLOAD_KEY: "source.filters.requestPayload.key",
  SOURCE_REQUEST_PAYLOAD_OPERATOR: "source.filters.requestPayload.operator",
  SOURCE_REQUEST_PAYLOAD_VALUE: "source.filters.requestPayload.value",
  SOURCE_PAGE_DOMAINS: "source.filters.pageDomains",
};

APP_CONSTANTS.GA_EVENTS = GA_EVENTS;

APP_CONSTANTS.url = {
  prod: "app.requestly.io",
  beta: "beta.requestly.io",
  local: "localhost:3000",
};

APP_CONSTANTS.mock_base_url = {
  prod: "https://requestly.tech/api/mockv2",
  beta: "https://beta.requestly.io/api/mockv2",
  local: "http://localhost:5001/requestly-dev/us-central1/handleMockRequest/api/mockv2", // Change port depending upon you firebase functions emulator port
};

export default APP_CONSTANTS;
