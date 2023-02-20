var URL_SOURCES = {
  GOOGLE: "http://www.google.com",
  GOOGLE_WITH_SLASH: "http://www.google.com/",
  YAHOO: "http://www.yahoo.com",
  FACEBOOK: "http://www.facebook.com",
  GOOGLE_SEARCH_QUERY: "https://www.google.co.in/search?q=",
  REQUESTLY: "http://app.requestly.in",
  DROPBOX: "http://www.dropbox.com",
  EXAMPLE: "http://www.example.com",
  QUORA: "https://www.quora.com",
};

var KEYWORDS = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  YAHOO: "yahoo",
  DROPBOX: "dropbox",
  EXAMPLE: "example",
  REQUESTLY: "requestly",
  QUORA: "quora",
};

var getBaseRule = function (props) {
  return {
    id: "",
    objectType: RQ.OBJECT_TYPES.RULE,
    name: "",
    description: "",
    creationDate: "",
    ruleType: "",
    status: RQ.RULE_STATUS.ACTIVE,
    groupId: "",
    isSample: false,
    ...props,
  };
};

var getGroup = function (props) {
  return {
    id: "",
    objectType: RQ.OBJECT_TYPES.GROUP,
    name: "",
    description: "",
    creationDate: "",
    status: RQ.GROUP_STATUS.ACTIVE,
    ...props,
  };
};

var getRedirectRule = function () {
  return getBaseRule({
    name: "Redirect Test Rule",
    ruleType: RQ.RULE_TYPES.REDIRECT,
    pairs: [
      {
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.GOOGLE,
        },
        destination: URL_SOURCES.QUORA,
      },
      {
        source: {
          key: RQ.RULE_KEYS.HOST,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.DROPBOX,
        },
        destination: URL_SOURCES.FACEBOOK, // Host contains dropbox -> facebook
      },
      {
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.WILDCARD_MATCHES,
          value: "*://*.yahoo.com",
        },
        destination: "$1://$2.yahoo.com?q1=$1&q2=$2",
      },
    ],
  });
};

var getCancelRule = function () {
  return getBaseRule({
    name: "Cancel Rule",
    ruleType: RQ.RULE_TYPES.CANCEL,
    pairs: [
      {
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.FACEBOOK,
        },
      },
      {
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.FACEBOOK,
        },
      },
    ],
  });
};

var getReplaceRule = function () {
  return getBaseRule({
    name: "Replace Rule",
    ruleType: RQ.RULE_TYPES.REPLACE,
    pairs: [
      {
        from: "/google/ig",
        to: "facebook",
      },
      {
        from: "?dl=0",
        to: "?dl=1",
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.DROPBOX,
        },
      },
      {
        from:
          "/\\?.+/ig" /* TODO: Figure out why double escaping is needed here but not in rule */,
        to: "",
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.EXAMPLE,
        },
      },
    ],
  });
};

var getHeadersRuleV1 = function () {
  return getBaseRule({
    name: "Headers Rule",
    ruleType: RQ.RULE_TYPES.HEADERS,
    pairs: [
      {
        type: RQ.MODIFICATION_TYPES.ADD,
        target: RQ.HEADERS_TARGET.REQUEST,
        header: "User-Agent",
        value: "Mozilla/5.0",
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
};

var getHeadersRuleV2 = function () {
  return getBaseRule({
    name: "Headers Rule",
    ruleType: RQ.RULE_TYPES.HEADERS,
    version: 2,
    pairs: [
      {
        modifications: {
          Request: [
            {
              type: RQ.MODIFICATION_TYPES.ADD,
              header: "User-Agent",
              value: "Mozilla/5.0",
            },
          ],
          Response: [
            {
              type: RQ.MODIFICATION_TYPES.ADD,
              header: "Server",
              value: "Apache",
            },
          ],
        },
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
};

var getUserAgentRule = function () {
  return getBaseRule({
    name: "UserAgent Rule",
    ruleType: RQ.RULE_TYPES.USERAGENT,
    pairs: [
      {
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.EXAMPLE,
        },
        env: "android.phone",
        envType: "device",
        userAgent: "Mozilla/5.0",
      },
    ],
  });
};

var getQueryParamsRule = function () {
  return getBaseRule({
    name: "QueryParams Rule",
    ruleType: RQ.RULE_TYPES.QUERYPARAM,
    pairs: [
      {
        modifications: [
          {
            type: RQ.MODIFICATION_TYPES.ADD,
            actionWhenParamExists: RQ.RULE_KEYS.OVERWRITE,
            param: "a",
            value: "1",
          },
          {
            type: RQ.MODIFICATION_TYPES.ADD,
            actionWhenParamExists: RQ.RULE_KEYS.OVERWRITE,
            param: "b",
            value: "2",
          },
        ],
        source: {
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: "",
        },
      },
    ],
  });
};

var getDelayRequestRule = function () {
  return getBaseRule({
    name: "Delay Test Rule",
    ruleType: RQ.RULE_TYPES.DELAY,
    pairs: [
      {
        delay: "3000",
        source: {
          filters: {},
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: KEYWORDS.EXAMPLE,
        },
      },
      {
        delay: "500",
        source: {
          filters: {},
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: "?a",
        },
      },
      {
        delay: "300",
        source: {
          filters: {},
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: "#delay",
        },
      },
      {
        delay: "300",
        source: {
          filters: {},
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.CONTAINS,
          value: URL_SOURCES.FACEBOOK,
        },
        delayType: "serverSideDelay",
      },
      {
        delay: "100",
        source: {
          filters: {},
          key: RQ.RULE_KEYS.URL,
          operator: RQ.RULE_OPERATORS.EQUALS,
          value: URL_SOURCES.DROPBOX,
        },
      },
    ],
  });
};

const getModifyResponseRule = function () {
  return getBaseRule({
    name: "modify search response in grofers",
    pairs: [
      {
        id: "zh6is",
        response: {
          type: "code",
          value:
            "function modifyResponse(args) {\n  const {method, url, response, responseType, requestHeaders, requestData} = args;\n  // Change response below depending upon request attributes received in args\n  response.products[0].name += 'Requestly magic';\n  \n  return response;\n}",
        },
        source: {
          filters: {},
          key: "Url",
          operator: "Wildcard_Matches",
          value: "*grofers.com/v5/search/merchants/*/products/",
        },
      },
    ],
    ruleType: RQ.RULE_TYPES.RESPONSE,
  });
};

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

const getExecutionLogObject = function () {
  return {
    id: RQ.Utils.generateExecutionLogId(),
    requestMethod: "GET",
    timestamp: Date.now(),
    url: URL_SOURCES.EXAMPLE,
    requestType: "xmlhttprequest",
    ruleName: "test",
    modification: "",
  };
};

const getPageSources = () => {
  return [
    {
      key: RQ.RULE_KEYS.URL,
      operator: RQ.RULE_OPERATORS.EQUALS,
      value: URL_SOURCES.GOOGLE,
    },
    {
      key: RQ.RULE_KEYS.HOST,
      operator: RQ.RULE_OPERATORS.CONTAINS,
      value: KEYWORDS.DROPBOX,
    },
    {
      key: RQ.RULE_KEYS.URL,
      operator: RQ.RULE_OPERATORS.WILDCARD_MATCHES,
      value: "*://*.yahoo.com",
    },
  ];
};
