// @ts-nocheck
import { RuleType } from "@requestly/shared/types/entities/rules";
import LINKS from "config/constants/sub/links";
import { RuleTemplate } from "features/rules/types/rules";
import { RuleDetails } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";

export const sampleRuleDetails: Record<string, { id: string; demoLink: string; details: RuleDetails }> = {
  OUz7jnsyudGhmAW2U6vy: {
    id: "OUz7jnsyudGhmAW2U6vy",
    demoLink: "https://www.requestly-playground.com/",
    details: {
      type: RuleType.SCRIPT,
      name: "Inject CSS/JS on a website",
      description:
        "The Insert Script rule allows you to inject custom JavaScript or styles into any website. With this rule, after the page is loaded you will see an custom alert.",
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
        "The Modify Response rule allows overriding existing GraphQL responses. For all requests containing operationName = Products, we override the existing responses with a specific one. As a result, all product responses will display details as if they were apples, showing apple inventory information.",
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  fHdTHi18fWcnPAhUOeL7: {
    id: "fHdTHi18fWcnPAhUOeL7",
    demoLink: "https://www.requestly-playground.com/",
    details: {
      type: RuleType.REDIRECT,
      name: "Redirect URL to another URL",
      description:
        "The Redirect Rule changes the HTTP request location to a new destination, serving the response from the new location transparently. With this rule, we redirect the original javascript to another javascript which would trigger a alert.",
      documentationLink: LINKS.REQUESTLY_REDIRECT_RULE_DOCS,
    },
  },
  "2Awil1731PYPaZDyPIIF": {
    id: "2Awil1731PYPaZDyPIIF",
    demoLink: "https://www.requestly-playground.com/",
    details: {
      type: RuleType.RESPONSE,
      name: "Modify HTTP Status Code",
      description:
        "The Modify Response rule allows overriding the status code of existing API responses. Instead of the regular responses, we'll be overriding the response code with 404. As a result, the products will continue loading indefinitely on the site.",
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  "6aET04CqE6UVKZmm5y32": {
    id: "6aET04CqE6UVKZmm5y32",
    demoLink: "https://www.requestly-playground.com/",
    details: {
      type: RuleType.REPLACE,
      name: "Replace a part of the URL",
      description: `The Replace Rule allows replacing a particular string in the URL with the desired string. In the playground, an API initially requested a list of bakery items, but we want a list of grocery items instead. By applying the Replace Rule, the category is switched from "bakery" to "grocery". This changes the listed items from juices and bread to fruits and vegetables.`,
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
    demoLink: "https://www.requestly-playground.com/",
    details: {
      type: RuleType.RESPONSE,
      name: "Override REST API Response",
      description: `The Modify Response rule allows overriding existing API responses. In this example, we modify the API response that provides product descriptions. Click on “Try this rule” to go to the playground and check the listed items. You will notice the descriptions of each item have changed.`,
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
};

export const localSampleRules: RuleTemplate[] = [
  {
    data: {
      ruleData: {
        isSample: false,
        schemaVersion: "3.0.0",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        description: "",
        creationDate: 1742403283719,
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
              value: "rest.requestly-playground.com/api/products",
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
        schemaVersion: "3.0.2",
        groupId: "Group_rg78s",
        lastModifiedBy: null,
        extensionRules: [
          {
            condition: {
              isUrlFilterCaseSensitive: true,
              regexFilter:
                "^(.*rest\\.requestly-playground\\.com/api.*)(#__rq_marker.*)$|(.*rest\\.requestly-playground\\.com/api.*)",
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
              regexFilter: "^(.*)type\\.slug:bakery(.*)#__rq_marker=(?:.*rest\\.requestly-playground\\.com/api.*)$",
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
        creationDate: 1742403283719,
        pairs: [
          {
            from: "type.slug:bakery",
            id: "qo1c4",
            source: {
              value: "rest.requestly-playground.com/api",
              key: "Url",
              operator: "Contains",
            },
            to: "type.slug:grocery",
          },
        ],
        objectType: "rule",
        modificationDate: 1743579347396,
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
        creationDate: 1742403283719,
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
              value: "https://graphql.requestly-playground.com/graphql",
              key: "Url",
              operator: "Contains",
            },
            isCompressed: false,
          },
        ],
        objectType: "rule",
        modificationDate: 1743578293046,
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
        createdBy: null,
        creationDate: 1742403283719,
        currentOwner: null,
        description: "",
        extensionRules: [
          {
            action: {
              responseHeaders: [
                {
                  header: "Content-Security-Policy",
                  operation: "remove",
                },
              ],
              type: "modifyHeaders",
            },
            condition: {
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
              isUrlFilterCaseSensitive: true,
              resourceTypes: ["main_frame", "sub_frame"],
              urlFilter: "requestly-playground.com",
            },
          },
        ],
        groupId: "Group_rg78s",
        id: "Script_2c6rd",
        isSample: false,
        lastModifiedBy: null,
        modificationDate: 1743579375423,
        name: "Inject CSS/JS on a websites",
        objectType: "rule",
        pairs: [
          {
            id: "i4ast",
            scripts: [
              {
                attributes: [
                  {
                    name: "type",
                    value: "text/javascript",
                  },
                ],
                codeType: "js",
                fileName: "",
                id: "eugs8",
                isCompressed: false,
                loadTime: "afterPageLoad",
                type: "code",
                value: '\t  alert("This banner is injected on the page by Requestly")',
              },
            ],
            source: {
              key: "Url",
              operator: "Contains",
              value: "requestly-playground.com",
            },
          },
        ],
        removeCSPHeader: true,
        ruleType: "Script",
        schemaVersion: "3.0.0",
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
        creationDate: 1742403283719,
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
              value: "rest.requestly-playground.com/api/products",
              key: "Url",
              operator: "Contains",
            },
            isCompressed: false,
          },
        ],
        objectType: "rule",
        modificationDate: 1743578326333,
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
        createdBy: null,
        creationDate: 1742403283719,
        currentOwner: null,
        description: "",
        extensionRules: [
          {
            action: {
              redirect: {
                url: "https://user21579.requestly.tech/internal/build?",
              },
              type: "redirect",
            },
            condition: {
              excludedInitiatorDomains: ["requestly.io"],
              excludedRequestDomains: ["requestly.io"],
              isUrlFilterCaseSensitive: true,
              regexFilter: "^https://www\\.requestly\\-playground\\.com/_next/static/(.*)/_buildManifest\\.js$",
            },
          },
        ],
        groupId: "Group_rg78s",
        id: "Redirect_lvucg",
        isFavourite: false,
        isSample: false,
        lastModifiedBy: null,
        modificationDate: 1743578347950,
        name: "Redirect URL to another URL",
        objectType: "rule",
        pairs: [
          {
            destination: "https://user21579.requestly.tech/internal/build?",
            destinationType: "url",
            id: "esfg9",
            source: {
              key: "Url",
              operator: "Wildcard_Matches",
              value: "https://www.requestly-playground.com/_next/static/*/_buildManifest.js",
            },
          },
        ],
        preserveCookie: false,
        ruleType: "Redirect",
        schemaVersion: "3.0.0",
        status: "Inactive",
      },
    },
    name: "",
    id: "fHdTHi18fWcnPAhUOeL7",
  },
  {
    data: {
      ruleData: {
        modificationDate: 1743579375725,
        children: [],
        createdBy: null,
        currentOwner: null,
        lastModifiedBy: null,
        name: "Sample Rules",
        description: "",
        id: "Group_rg78s",
        creationDate: 1742403283719,
        objectType: "group",
        status: "Inactive",
      },
    },
    name: "",
    id: "wfa2nnDPUJJXQ5RL7ufD",
  },
];
