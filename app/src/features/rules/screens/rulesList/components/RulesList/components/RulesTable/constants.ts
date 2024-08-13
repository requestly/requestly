// @ts-nocheck
import LINKS from "config/constants/sub/links";
import { RuleType } from "types";
import { RuleDetails } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";

export const sampleRuleDetails: Record<string, { id: string; demoLink: string; details: RuleDetails }> = {
  OUz7jnsyudGhmAW2U6vy: {
    id: "OUz7jnsyudGhmAW2U6vy",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=inject-scripts",
    details: {
      type: RuleType.SCRIPT,
      name: "Inject CSS/JS on a website",
      description:
        "The Insert Script rule allows you to inject custom JavaScript or styles into any website. With this rule, the background of the items is changed by injecting custom CSS. Toggle the rule on and off and reload the website to observe the differences.",
      documentationLink: LINKS.REQUESTLY_SCRIPT_RULE_DOCS,
    },
  },
  Dfj22UZieI0OvHxBg3xO: {
    id: "Dfj22UZieI0OvHxBg3xO",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=override-api-response-graphql",
    details: {
      type: RuleType.RESPONSE,
      name: "Override GraphQL API Response",
      description:
        "The Modify Response rule allows overriding existing GraphQL responses. For all requests containing operationName = Products, we override the existing responses with a specific one. As a result, all product responses will display details as if they were apples, showing apple inventory information. Toggle the rule on and off and reload the website to observe the differences.",
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  fHdTHi18fWcnPAhUOeL7: {
    id: "fHdTHi18fWcnPAhUOeL7",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=redirect",
    details: {
      type: RuleType.REDIRECT,
      name: "Redirect URL to another URL",
      description:
        "The Redirect Rule changes the HTTP request location to a new destination, serving the response from the new location transparently. With this rule, we redirect the API that fetches bakery items to the one that fetches gadgets and electronic items. This changes the listed items in the store from juices and bread to gaming consoles and computers. Toggle the rule on and off and reload the website to observe the differences.",
      documentationLink: LINKS.REQUESTLY_REDIRECT_RULE_DOCS,
    },
  },
  "2Awil1731PYPaZDyPIIF": {
    id: "2Awil1731PYPaZDyPIIF",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=modify-http-status-code-rest",
    details: {
      type: RuleType.RESPONSE,
      name: "Modify HTTP Status Code",
      description:
        "The Modify Response rule allows overriding the status code of existing API responses. Instead of the regular responses, we'll be overriding the response code with 404. As a result, the products will continue loading indefinitely on the site. Toggle the rule on and off and reload the website to observe the differences.",
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  "6aET04CqE6UVKZmm5y32": {
    id: "6aET04CqE6UVKZmm5y32",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=replace",
    details: {
      type: RuleType.REPLACE,
      name: "Replace a part of the URL",
      description: `The Replace Rule allows replacing a particular string in the URL with the desired string. In the playground, an API initially requested a list of bakery items, but we want a list of grocery items instead. By applying the Replace Rule, the category is switched from "bakery" to "grocery". This changes the listed items from juices and bread to fruits and vegetables. Toggle the rule on and off and reload the website to observe the differences.`,
      documentationLink: LINKS.REQUESTLY_REPLACE_RULE_DOCS,
    },
  },
  wfa2nnDPUJJXQ5RL7ufD: {
    id: "wfa2nnDPUJJXQ5RL7ufD",
    demoLink: "",
    details: {
      type: "",
      name: "",
      description: "",
      documentationLink: "",
    },
  },
  YOZANnLUk144snA755Lh: {
    id: "YOZANnLUk144snA755Lh",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=override-api-response-rest",
    details: {
      type: RuleType.RESPONSE,
      name: "Override REST API Response",
      description: `The Modify Response rule allows overriding existing API responses. In this example, we modify the API response that provides product descriptions. Click on “Try this rule” to go to the playground and check the listed items. You will notice the descriptions of each item have changed. Toggle the rule on and off and reload the website to observe the differences.`,
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
};

export const localSampleRules = [
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        description: "",
        creationDate: 1720336454573,
        pairs: [
          {
            response: {
              statusText: "Not Found",
              type: "code",
              value:
                "function modifyResponse(args) {\n  const {method, url, response, responseType, requestHeaders, requestData, responseJSON} = args;\n  // Change response below depending upon request attributes received in args\n  \n  return response;\n}",
              resourceType: "restApi",
              statusCode: "404",
            },
            id: "2xj8r",
            source: {
              value: "mock.redq.io/api/products",
              key: "Url",
              operator: "Contains",
            },
            isCompressed: false,
          },
        ],
        objectType: "rule",
        modificationDate: 1720337019638,
        createdBy: null,
        currentOwner: null,
        ruleType: "Response",
        name: "Modify HTTP Status Code",
        id: "Response_gguzf",
        status: "Inactive",
      },
    },
    name: "",
    id: "2Awil1731PYPaZDyPIIF",
  },
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.1",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        extensionRules: [
          {
            condition: {
              isUrlFilterCaseSensitive: true,
              regexFilter:
                "^(.*https://mock\\.redq\\.io/api/products.*)(#__rq_marker.*)$|(.*https://mock\\.redq\\.io/api/products.*)",
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
            },
            action: {
              redirect: {
                regexSubstitution: "\\1\\3#__rq_marker=\\1\\3",
              },
              type: "redirect",
            },
            priority: 1,
          },
          {
            condition: {
              isUrlFilterCaseSensitive: true,
              regexFilter: "^(.*)type\\.slug:bakery(.*)#__rq_marker=(?:.*https://mock\\.redq\\.io/api/products.*)$",
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
            },
            action: {
              redirect: {
                regexSubstitution: "\\1type.slug:grocery\\2",
              },
              type: "redirect",
            },
            priority: 2,
          },
        ],
        description: "",
        creationDate: 1720340003757,
        pairs: [
          {
            from: "type.slug:bakery",
            id: "qo1c4",
            source: {
              value: "https://mock.redq.io/api/products",
              key: "Url",
              operator: "Contains",
            },
            to: "type.slug:grocery",
          },
        ],
        objectType: "rule",
        modificationDate: 1720340105234,
        createdBy: null,
        currentOwner: null,
        ruleType: "Replace",
        name: "Replace a part of the URL",
        id: "Replace_6tb3l",
        status: "Inactive",
      },
    },
    name: "",
    id: "6aET04CqE6UVKZmm5y32",
  },
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        description: "",
        creationDate: 1720335748379,
        pairs: [
          {
            response: {
              type: "code",
              value:
                'function modifyResponse(args) {\n  const { response } = args;\n  const modifiedResponse = JSON.parse(response);\n\n  modifiedResponse.data.products.data.forEach((item) => {\n    item.name = "Modified Product";\n    item.image = {\n      id: "2",\n      original: "https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/1/Apples.jpg",\n      __typename: "Attachment",\n    };\n  });\n\n  return modifiedResponse;\n}\n',
              resourceType: "graphqlApi",
              statusCode: "",
            },
            id: "77bwh",
            source: {
              filters: [
                {
                  requestPayload: {
                    value: "Products",
                    key: "operationName",
                  },
                },
              ],
              value: "https://mock.redq.io/graphql",
              key: "Url",
              operator: "Contains",
            },
            isCompressed: false,
          },
        ],
        objectType: "rule",
        modificationDate: 1720336361914,
        createdBy: null,
        currentOwner: null,
        ruleType: "Response",
        name: "Override GraphQL API Response",
        id: "Response_jtdff",
        status: "Inactive",
      },
    },
    name: "",
    id: "Dfj22UZieI0OvHxBg3xO",
  },
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        extensionRules: [
          {
            condition: {
              isUrlFilterCaseSensitive: true,
              resourceTypes: ["main_frame", "sub_frame"],
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
              urlFilter: "requestly-playground.com",
            },
            action: {
              responseHeaders: [
                {
                  header: "Content-Security-Policy",
                  operation: "remove",
                },
              ],
              type: "modifyHeaders",
            },
          },
        ],
        removeCSPHeader: true,
        description: "",
        creationDate: 1720339242328,
        pairs: [
          {
            id: "ga46v",
            source: {
              value: "requestly-playground.com",
              key: "Url",
              operator: "Contains",
            },
            scripts: [
              {
                fileName: "",
                loadTime: "afterPageLoad",
                codeType: "css",
                id: "v7ha8",
                type: "code",
                value:
                  "\t.product-card {\n\t\t background-color: #e0ffe5;\n\t}\n\t  .product-image{\n\t    mix-blend-mode: darken\n\t  }",
                isCompressed: false,
              },
            ],
          },
        ],
        objectType: "rule",
        modificationDate: 1721978580742,
        createdBy: null,
        currentOwner: null,
        ruleType: "Script",
        name: "Inject CSS/JS on a website",
        id: "Script_oyiv1",
        status: "Inactive",
      },
    },
    name: "",
    id: "OUz7jnsyudGhmAW2U6vy",
  },
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        description: "",
        creationDate: 1720333389088,
        pairs: [
          {
            response: {
              type: "code",
              value:
                'function modifyResponse(args) {\n  const { response } = args;\n  const modifiedResponse = JSON.parse(response);\n\n  modifiedResponse.data.forEach(item => {\n    item.name = "This is Modified Product";\n  });\n\n  return modifiedResponse;\n}\n',
              resourceType: "restApi",
              statusCode: "",
            },
            id: "obnxx",
            source: {
              value: "mock.redq.io/api/products",
              key: "Url",
              operator: "Contains",
            },
            isCompressed: false,
          },
        ],
        objectType: "rule",
        modificationDate: 1720335715632,
        createdBy: null,
        currentOwner: null,
        ruleType: "Response",
        name: "Override REST API Response",
        id: "Response_b6gml",
        status: "Inactive",
      },
    },
    name: "",
    id: "YOZANnLUk144snA755Lh",
  },
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        extensionRules: [
          {
            condition: {
              isUrlFilterCaseSensitive: true,
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
              urlFilter:
                "https://mock.redq.io/api/products?searchJoin=and&with=type%3Bauthor&limit=30&language=en&search=type.slug:bakery%3Bstatus:publish",
            },
            action: {
              redirect: {
                url:
                  "https://mock.redq.io/api/products?searchJoin=and&with=type%3Bauthor&limit=30&language=en&search=type.slug:gadget%3Bstatus:publish",
              },
              type: "redirect",
            },
          },
        ],
        description: "",
        creationDate: 1720340144660,
        pairs: [
          {
            destination:
              "https://mock.redq.io/api/products?searchJoin=and&with=type%3Bauthor&limit=30&language=en&search=type.slug:gadget%3Bstatus:publish",
            destinationType: "url",
            id: "esfg9",
            source: {
              value:
                "https://mock.redq.io/api/products?searchJoin=and&with=type%3Bauthor&limit=30&language=en&search=type.slug:bakery%3Bstatus:publish",
              key: "Url",
              operator: "Contains",
            },
          },
        ],
        objectType: "rule",
        modificationDate: 1721994687709,
        createdBy: null,
        currentOwner: null,
        ruleType: "Redirect",
        name: "Redirect URL to another URL",
        id: "Redirect_kfxyi",
        preserveCookie: false,
        status: "Inactive",
      },
    },
    name: "",
    id: "fHdTHi18fWcnPAhUOeL7",
  },
  {
    data: {
      ruleData: {
        modificationDate: 1722422420602,
        children: [],
        createdBy: null,
        currentOwner: null,
        lastModifiedBy: null,
        name: "Sample Rules",
        description: "",
        id: "Group_rg78s",
        creationDate: 1720183210880,
        objectType: "group",
        status: "Inactive",
      },
    },
    name: "",
    id: "wfa2nnDPUJJXQ5RL7ufD",
  },
];
