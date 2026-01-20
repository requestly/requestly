import RuleIcon from "components/common/RuleIcon";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
//UTILS
import { isDesktopMode } from "utils/AppUtils";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "./features";

const getSourceFormat = () => ({
  filters: [],
  key: GLOBAL_CONSTANTS.RULE_KEYS.URL,
  operator: GLOBAL_CONSTANTS.RULE_OPERATORS.CONTAINS,
  value: "",
});

const modifyResponseDefaultCode = () => {
  let value =
    "function modifyResponse(args) {\n  const {method, url, response, responseType, requestHeaders, requestData, responseJSON} = args;\n  // Change response below depending upon request attributes received in args\n  \n  return response;\n}";

  if (isFeatureCompatible(FEATURES.ASYNC_MODIFY_RESPONSE_BODY)) {
    value = "async " + value;
  }

  return value;
};

const modifyRequestDefaultCode = () => {
  let value =
    "function modifyRequestBody(args) {\n  const { method, url, body, bodyAsJson } = args;\n  // Change request body below depending upon request attributes received in args\n  \n  return body;\n}";

  if (isFeatureCompatible(FEATURES.ASYNC_MODIFY_RESPONSE_BODY)) {
    value = "async " + value;
  }

  return value;
};

const getHeaderMetadataConfig = () => {
  return RULE_METADATA_CONFIG[GLOBAL_CONSTANTS.RULE_TYPES.HEADERS]["V2"];
};

const RULE_METADATA_CONFIG = {
  [GLOBAL_CONSTANTS.RULE_TYPES.HEADERS]: {
    V1: {
      EMPTY_PAIR_FORMAT: {
        header: "",
        value: "",
        type: "Add",
        target: "Request",
        source: getSourceFormat(),
      },
    },
    V2: {
      VERSION: 2,
      EMPTY_PAIR_FORMAT: {
        modifications: {
          Request: [],
          Response: [],
        },
        source: getSourceFormat(),
      },
      EMPTY_MODIFICATION_FORMAT: {
        header: "",
        value: "",
        type: "Add",
      },
    },
  },
};

const RULE_TYPES_CONFIG = {
  [GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT]: {
    ID: 1,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT,
    NAME: "Redirect Request",
    DESCRIPTION: "Map Local or Redirect a matching pattern to another URL",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT} />,
    PRIMARY_COLOR: "#5b9027",
    SECONDARY_COLOR: "#4E7C22",
    TOOL_TIP_PLACEMENT: "top",
    PAIR_CONFIG: {
      TITLE: "Rule Conditions",
    },
    EMPTY_PAIR_FORMAT: {
      destination: "",
      destinationType: "url",
      source: getSourceFormat(),
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: false,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.CANCEL]: {
    ID: 2,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.CANCEL,
    NAME: "Cancel Request",
    DESCRIPTION: "Block URLs by specifying keywords or entire URL",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.CANCEL} />,
    PRIMARY_COLOR: "#d32a0e",
    SECONDARY_COLOR: "#BB250C",
    TOOL_TIP_PLACEMENT: "top",
    PAIR_CONFIG: {
      TITLE: "Enter Keywords or URLs or Domains to be blocked",
    },
    EMPTY_PAIR_FORMAT: {
      source: getSourceFormat(),
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: false,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.REPLACE]: {
    ID: 3,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.REPLACE,
    NAME: "Replace String",
    DESCRIPTION: "Replace parts of URL like hostname, query value",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.REPLACE} />,
    PRIMARY_COLOR: "#2aa5e7",
    SECONDARY_COLOR: "#199ADE",
    TOOL_TIP_PLACEMENT: "top",
    PAIR_CONFIG: {
      TITLE: "Enter the part of URL that needs to be replaced",
    },
    EMPTY_PAIR_FORMAT: {
      from: "",
      to: "",
      source: getSourceFormat(),
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: false,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.HEADERS]: {
    ID: 4,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.HEADERS,
    NAME: "Modify Headers",
    DESCRIPTION: "Modify HTTP headers in request and response",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.HEADERS} />,
    PRIMARY_COLOR: "#dd9d12",
    SECONDARY_COLOR: "#C58C10",
    TOOL_TIP_PLACEMENT: "top",
    PAIR_CONFIG: {
      TITLE: "Headers Modification Rules",
    },
    ...getHeaderMetadataConfig(),
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM]: {
    ID: 5,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM,
    NAME: "Query Param",
    DESCRIPTION: "Add or Remove Query Parameters",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM} />,
    PRIMARY_COLOR: "#AA66CC",
    SECONDARY_COLOR: "#9F53C6",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: "Query Parameter Modifications",
    },
    EMPTY_PAIR_FORMAT: {
      modifications: [],
      source: getSourceFormat(),
    },
    EMPTY_MODIFICATION_FORMAT: {
      actionWhenParamExists: GLOBAL_CONSTANTS.RULE_KEYS.OVERWRITE,
      param: "",
      type: "Add",
      value: "",
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT]: {
    ID: 6,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT,
    NAME: "Insert Scripts",
    DESCRIPTION: "Inject Custom JavaScript (JS) or Styles (CSS) to any website",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT} />,
    PRIMARY_COLOR: "#444340",
    SECONDARY_COLOR: "#373634",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: "Insert Scripts",
    },
    EMPTY_PAIR_FORMAT: {
      libraries: [],
      source: getSourceFormat(),
      scripts: [],
    },
    EMPTY_SCRIPT_FORMAT: {
      codeType: "js",
      fileName: "",
      loadTime: "afterPageLoad",
      type: "code",
      value: "",
    },
    ALLOW_ADD_PAIR: false,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: false,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
    CUSTOM_SCRIPT_CHARACTER_LIMIT: 500,
    REMOVE_CSP_HEADER: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE]: {
    ID: 7,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE,
    NAME: isDesktopMode() ? "Modify Response" : "Modify API Response",
    DESCRIPTION: isDesktopMode() ? "Modify Response of any HTTP request" : "Modify Response of any XHR/Fetch request",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE} />,
    PRIMARY_COLOR: "#880e4f",
    SECONDARY_COLOR: "#710C42",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: isDesktopMode()
        ? "Return any custom response through code, local files or as static JSON data"
        : "Modify response of an XHR/fetch request",
    },
    EMPTY_PAIR_FORMAT: {
      source: getSourceFormat(),
      response: {
        type: "static",
        value: "",
        statusCode: "",
        resourceType: "",
      },
    },
    ALLOW_ADD_PAIR: false,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: false,
    ALLOW_APPLY_RULE_TO_ALL_URLS: false,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
    RESPONSE_BODY_CHARACTER_LIMIT: 1500,
    RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE: modifyResponseDefaultCode(),
  },

  [GLOBAL_CONSTANTS.RULE_TYPES.REQUEST]: {
    ID: 10,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.REQUEST,
    NAME: "Modify Request Body",
    DESCRIPTION: "Override API request body with static or programmatic data",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.REQUEST} />,
    PRIMARY_COLOR: "#880e4f",
    SECONDARY_COLOR: "#710C42",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: "Modify POST Request",
    },
    EMPTY_PAIR_FORMAT: {
      source: getSourceFormat(),
      request: {
        type: "static",
        value: "",
        resourceType: "",
      },
    },
    ALLOW_ADD_PAIR: false,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: false,
    ALLOW_APPLY_RULE_TO_ALL_URLS: false,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
    REQUEST_BODY_CHARACTER_LIMIT: 1500,
    REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE: modifyRequestDefaultCode(),
  },

  [GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT]: {
    ID: 8,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT,
    NAME: "User-Agent",
    DESCRIPTION: "Emulate for different devices by varying user-agent",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT} />,
    PRIMARY_COLOR: "#2bbbad",
    SECONDARY_COLOR: "#26A69A",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: "Rule Conditions",
    },
    EMPTY_PAIR_FORMAT: {
      source: getSourceFormat(),
      env: "",
      envType: "",
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  [GLOBAL_CONSTANTS.RULE_TYPES.DELAY]: {
    ID: 9,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.DELAY,
    NAME: "Delay Network Requests",
    DESCRIPTION: "Introduce a lag or delay to the response from specific URLs",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.DELAY} />,
    PRIMARY_COLOR: "#68ce35",
    SECONDARY_COLOR: "#5ab52d",
    TOOL_TIP_PLACEMENT: "bottom",
    PAIR_CONFIG: {
      TITLE: "Enter Request URL Pattern",
    },
    EMPTY_PAIR_FORMAT: {
      source: getSourceFormat(),
      delay: "100",
    },
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: false,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
  // LEGACY
  // V1 Headers Schema
  [GLOBAL_CONSTANTS.RULE_TYPES.HEADERS_V1]: {
    ID: 11,
    TYPE: GLOBAL_CONSTANTS.RULE_TYPES.HEADERS,
    NAME: "Modify Headers",
    DESCRIPTION: "Modify HTTP headers in request and response",
    ICON: () => <RuleIcon ruleType={GLOBAL_CONSTANTS.RULE_TYPES.HEADERS} />,
    PRIMARY_COLOR: "#dd9d12",
    SECONDARY_COLOR: "#C58C10",
    TOOL_TIP_PLACEMENT: "top",
    PAIR_CONFIG: {
      TITLE: "Headers Modification Rules",
    },
    EMPTY_PAIR_FORMAT: {
      header: "",
      value: "",
      type: "Add",
      target: "Request",
      source: getSourceFormat(),
    },
    SHOW_DELETE_PAIR_ICON_ON_SOURCE_ROW: true,
    ALLOW_ADD_PAIR: true,
    HIDE_IN_EXTENSION: false,
    HIDE: true,
    ALLOW_APPLY_RULE_TO_ALL_URLS: true,
    ALLOW_REQUEST_SOURCE_FILTERS: true,
  },
};

export default RULE_TYPES_CONFIG;
