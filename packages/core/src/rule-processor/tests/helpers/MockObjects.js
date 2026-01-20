import CONSTANTS from "../../../constants";

export const URL_SOURCES = {
  GOOGLE: "http://www.google.com",
  GOOGLE_WITH_SLASH: "http://www.google.com/",
  YAHOO: "http://www.yahoo.com",
  FACEBOOK: "http://www.facebook.com",
  GOOGLE_SEARCH_QUERY: "https://www.google.co.in/search?q=",
  REQUESTLY: "http://app.requestly.in",
  DROPBOX: "http://www.dropbox.com",
  EXAMPLE: "http://www.example.com",
  QUORA: "https://www.quora.com",
  TESTHEADERS: "https://testheaders.com/",
};

export const KEYWORDS = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  YAHOO: "yahoo",
  DROPBOX: "dropbox",
  EXAMPLE: "example",
  REQUESTLY: "requestly",
  QUORA: "quora",
};

export const sourceFilters = {
  [CONSTANTS.RULE_SOURCE_FILTER_TYPES.PAGE_URL]: [
    { operator: CONSTANTS.RULE_OPERATORS.CONTAINS, value: KEYWORDS.EXAMPLE },
  ],
  [CONSTANTS.RULE_SOURCE_FILTER_TYPES.RESOURCE_TYPE]: ["xmlhttprequest"],
  [CONSTANTS.RULE_SOURCE_FILTER_TYPES.REQUEST_METHOD]: ["GET", "POST"],
};

export const requestDetails = {
  method: "GET",
  type: "xmlhttprequest",
  pageUrl: "example.com",
};

export function getBaseRule(props) {
  return {
    id: "",
    objectType: CONSTANTS.OBJECT_TYPES.RULE,
    name: "",
    description: "",
    creationDate: "",
    ruleType: "",
    status: CONSTANTS.RULE_STATUS.ACTIVE,
    groupId: "",
    isSample: false,
    ...props,
  };
}

export function getGroup(props) {
  return {
    id: "",
    objectType: CONSTANTS.OBJECT_TYPES.GROUP,
    name: "",
    description: "",
    creationDate: "",
    status: CONSTANTS.GROUP_STATUS.ACTIVE,
    ...props,
  };
}

export function getRedirectRule() {
  return getBaseRule({
    name: "Redirect Test Rule",
    ruleType: CONSTANTS.RULE_TYPES.REDIRECT,
    preserveCookie: false,
    pairs: [
      {
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.GOOGLE,
        },
        destination: URL_SOURCES.QUORA,
      },
      {
        source: {
          key: CONSTANTS.RULE_KEYS.HOST,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.DROPBOX,
        },
        destination: URL_SOURCES.FACEBOOK, // Host contains dropbox -> facebook
      },
      {
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES,
          value: "*://*.yahoo.com",
        },
        destination: "$1://$2.yahoo.com?q1=$1&q2=$2",
      },
    ],
  });
}

export function getCancelRule() {
  return getBaseRule({
    name: "Cancel Rule",
    ruleType: CONSTANTS.RULE_TYPES.CANCEL,
    pairs: [
      {
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.FACEBOOK,
        },
      },
      {
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.FACEBOOK,
        },
      },
    ],
  });
}

export function getReplaceRule() {
  return getBaseRule({
    name: "Replace Rule",
    ruleType: CONSTANTS.RULE_TYPES.REPLACE,
    pairs: [
      {
        from: "/google/ig",
        to: "facebook",
      },
      {
        from: "?dl=0",
        to: "?dl=1",
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.DROPBOX,
        },
      },
      {
        from: "/\\?.+/ig" /* TODO: Figure out why double escaping is needed here but not in rule */,
        to: "",
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.EXAMPLE,
        },
      },
    ],
  });
}

export function getHeadersRuleV1() {
  return getBaseRule({
    name: "Headers Rule",
    ruleType: CONSTANTS.RULE_TYPES.HEADERS,
    pairs: [
      {
        type: CONSTANTS.MODIFICATION_TYPES.ADD,
        target: CONSTANTS.HEADERS_TARGET.REQUEST,
        header: "User-Agent",
        value: "Mozilla/5.0",
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
}

export function getHeadersRuleV2() {
  return getBaseRule({
    name: "Headers Rule",
    ruleType: CONSTANTS.RULE_TYPES.HEADERS,
    version: 2,
    pairs: [
      {
        modifications: {
          Request: [
            {
              type: CONSTANTS.MODIFICATION_TYPES.ADD,
              header: "User-Agent",
              value: "Mozilla/5.0",
            },
          ],
          Response: [
            {
              type: CONSTANTS.MODIFICATION_TYPES.ADD,
              header: "Server",
              value: "Apache",
            },
          ],
        },
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
}

export function getUserAgentRule() {
  return getBaseRule({
    name: "UserAgent Rule",
    ruleType: CONSTANTS.RULE_TYPES.USERAGENT,
    pairs: [
      {
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.EXAMPLE,
        },
        env: "android.phone",
        envType: "device",
        userAgent: "Mozilla/5.0",
      },
    ],
  });
}

export function getQueryParamsRule() {
  return getBaseRule({
    name: "QueryParams Rule",
    ruleType: CONSTANTS.RULE_TYPES.QUERYPARAM,
    pairs: [
      {
        modifications: [
          {
            type: CONSTANTS.MODIFICATION_TYPES.ADD,
            actionWhenParamExists: CONSTANTS.RULE_KEYS.OVERWRITE,
            param: "a",
            value: "1",
          },
          {
            type: CONSTANTS.MODIFICATION_TYPES.ADD,
            actionWhenParamExists: CONSTANTS.RULE_KEYS.OVERWRITE,
            param: "b",
            value: "2",
          },
        ],
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
}

export function getDelayRequestRule() {
  return getBaseRule({
    name: "Delay Test Rule",
    ruleType: CONSTANTS.RULE_TYPES.DELAY,
    pairs: [
      {
        delay: "3000",
        source: {
          filters: {},
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.EXAMPLE,
        },
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      },
      {
        delay: "500",
        source: {
          filters: {},
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: "?a",
        },
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      },
      {
        delay: "300",
        source: {
          filters: {},
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: "#delay",
        },
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      },
      {
        delay: "300",
        source: {
          filters: {},
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.CONTAINS,
          value: URL_SOURCES.FACEBOOK,
        },
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.SERVER_SIDE,
      },
      {
        delay: "100",
        source: {
          filters: {},
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.DROPBOX,
        },
        delayType: CONSTANTS.DELAY_REQUEST_CONSTANTS.DELAY_TYPE.CLIENT_SIDE,
      },
    ],
  });
}

export function getModifyResponseRule() {
  return getBaseRule({
    name: "Test Modify Response Rule",
    ruleType: CONSTANTS.RULE_TYPES.RESPONSE,
    pairs: [
      {
        isCompressed: false,
        source: {
          key: CONSTANTS.RULE_KEYS.URL,
          operator: CONSTANTS.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.TESTHEADERS,
        },
        response: {
          resourceType: "restApi",
          statusCode: "202",
          type: CONSTANTS.RESPONSE_BODY_TYPES.STATIC,
          value: `{
            "name": "John Doe",
            "age": 30,
            "email": "john.doe@example.com"
            }`,
        },
      },
    ],
  });
}

const getPlanDetails = function () {
  return {
    planId: "plan_EKlT4oVoZEL65L",
    status: "active",
    subscription: {
      current_period_end: 1550677774,
      current_period_start: 1547999374,
      id: "sub_ENTV9aJ68WBMEw",
    },
    token: "some_token_value",
  };
};

const getUserDetails = function () {
  return {
    isLoggedIn: true,
    profile: {
      name: "Random Horse",
      email: "randomhorse@google.com",
    },
    planDetails: getPlanDetails(),
  };
};
