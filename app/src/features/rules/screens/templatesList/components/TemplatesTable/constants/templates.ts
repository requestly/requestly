import {
  HeaderRule,
  QueryParamRule,
  RecordStatus,
  RecordType,
  RedirectRule,
  ResponseRule,
  RuleSourceKey,
  RuleSourceOperator,
  RuleType,
  ScriptRule,
} from "@requestly/shared/types/entities/rules";
import { ResourceType } from "@requestly/shared/types/common/network";

import { TemplateRecord } from "../types";

const templateRecords: TemplateRecord[] = [
  {
    id: "0",
    name: "Redirect JS from production to local environment",
    description: "Load local JS files instead of production for testing purposes.",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704366536394,
        description: "Load local JS files instead of production for testing purposes.",
        groupId: "",
        id: "Redirect_yr8on",
        isSample: false,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        modificationDate: 1704367057269,
        name: "Redirect JS from production to local environment",
        objectType: RecordType.RULE,
        pairs: [
          {
            destination: "http://localhost:8000/scripts/main.js",
            destinationType: RedirectRule.DestinationType.URL,
            id: "9h8ir",
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://www.example.com/scripts/main.js",
            },
          },
        ],
        preserveCookie: false,
        ruleType: RuleType.REDIRECT,
        status: RecordStatus.INACTIVE,
      },
    },
  },
  {
    id: "1",
    name: "Inject JS into Customer Site",
    description: "Inject your JavaScript into a potential customer's website for testing purpose.",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704367507742,
        description: "Inject your JavaScript into a potential customer's website for testing purpose.",
        groupId: "",
        id: "Script_rr1wa",
        isSample: false,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        modificationDate: 1704367578197,
        name: "Inject JS into Customer Site",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "gjjnt",
            scripts: [
              {
                codeType: ScriptRule.ScriptType.JS,
                fileName: "",
                id: "fnujk",
                loadTime: ScriptRule.ScriptLoadTime.AFTER_PAGE_LOAD,
                type: ScriptRule.ScriptValueType.URL,
                value: "https://www.yourserver.com/yourscript.js",
              },
            ],
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://www.customersite.com",
            },
          },
        ],
        ruleType: RuleType.SCRIPT,
        status: RecordStatus.INACTIVE,
      },
    },
  },
  {
    id: "2",
    name: "Bypass CORS",
    description: "You can Bypass CORS by turning this on",
    imageURL:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8oBmecALAzN-kd73MyovxZKNzg0fHSvM6-xStnS8AXnoccY2oIkSVNz179uZgbIEajVE&usqp=CAU",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643755328278,
        description: "You can Bypass CORS by turning this on",
        groupId: "",
        id: "Headers_qdrqr",
        isSample: false,
        name: "Bypass CORS",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "z3v66",
            modifications: {
              Request: [],
              Response: [
                {
                  header: "Access-Control-Allow-Origin",
                  type: HeaderRule.ModificationType.ADD,
                  value: "rq_request_initiator_origin()",
                },
                {
                  header: "Access-Control-Allow-Methods",
                  type: HeaderRule.ModificationType.ADD,
                  value: "*",
                },
                {
                  header: "Access-Control-Allow-Headers",
                  type: HeaderRule.ModificationType.ADD,
                  value: "*",
                },
                {
                  header: "Access-Control-Allow-Credentials",
                  type: HeaderRule.ModificationType.ADD,
                  value: "true",
                },
              ],
            },
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "<yourdomain.com>",
            },
          },
        ],
        ruleType: RuleType.HEADERS,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643756052651,
        version: 2,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
      },
    },
  },
  {
    id: "3",
    name: "Add Authorization Header to all localhost requests",
    description: "Add a custom value for the Authorization header for all requests to localhost",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704367224978,
        description: "Add a custom value for the Authorization header for all requests to localhost",
        groupId: "",
        id: "Headers_xcq3c",
        isSample: false,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        modificationDate: 1704367312343,
        name: "Add Authorization Header to all localhost requests",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "4kuze",
            modifications: {
              Request: [
                {
                  header: "Authorization",
                  id: "5jipq",
                  type: HeaderRule.ModificationType.ADD,
                  value: "Bearer your_custom_token",
                },
              ],
            },
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "localhost",
            },
          },
        ],
        ruleType: RuleType.HEADERS,
        status: RecordStatus.INACTIVE,
        version: 2,
      },
    },
  },
  {
    id: "4",
    name: "Override response of an API",
    description: "Modify API response of an API call made at /exampleAPI endpoint in testheader.com",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704880778479,
        description: "Modify API response of an API call made at /exampleAPI endpoint in testheader.com",
        groupId: "",
        id: "Response_i4w57",
        isSample: false,
        lastModifiedBy: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        currentOwner: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        createdBy: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        modificationDate: 1704880979492,
        name: "Override response of an API",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "qvgs0",
            response: {
              resourceType: ResponseRule.ResourceType.REST_API,
              statusCode: "",
              type: ResponseRule.BodyType.STATIC,
              value: '{"userId":2,"status":"response modified!"}',
            },
            source: {
              filters: [],
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://testheaders.com/exampleAPI",
            },
          },
        ],
        ruleType: RuleType.RESPONSE,
        status: RecordStatus.INACTIVE,
      },
    },
  },

  {
    id: "5",
    name: "Remove Content-Security-Policy Header",
    description: "Turn this on and see content-security-policy header being removed",
    imageURL: "",
    isSharedList: false,
    isFeatured: true,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        version: 2,
        creationDate: 1643724819721,
        description: "Turn this on and see content-security-policy header being removed",
        groupId: "",
        id: "Headers_ddon1",
        isSample: false,
        modificationDate: 1644102502913,
        name: "Remove Content-Security-Policy Header",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "7tg21",
            modifications: {
              Request: [],
              Response: [
                {
                  header: "content-security-policy",
                  type: HeaderRule.ModificationType.REMOVE,
                  value: "",
                },
              ],
            },
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "",
            },
          },
        ],
        ruleType: RuleType.HEADERS,
        status: RecordStatus.INACTIVE,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "6",
    name: "Simulate 404 status code",
    description: "Returning 404 status code in response of an API call made at /exampleAPI endpoint in testheader.com",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704883199214,
        description:
          "Returning 404 status code in response of an API call made at /exampleAPI endpoint in testheader.com",
        groupId: "",
        id: "Response_dp6lk",
        isSample: false,
        lastModifiedBy: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        currentOwner: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        createdBy: "pVuHQhkmZpPR5QHa1xsjRgLIk3t1",
        modificationDate: 1704883461547,
        name: "Simulate 404 status code",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "qoa22",
            response: {
              resourceType: ResponseRule.ResourceType.REST_API,
              statusCode: "404",
              statusText: "Not Found",
              type: ResponseRule.BodyType.STATIC,
              value: "{}",
            },
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://testheaders.com/exampleAPI",
            },
          },
        ],
        ruleType: RuleType.RESPONSE,
        status: RecordStatus.INACTIVE,
      },
    },
  },
  {
    id: "7",
    name: "Toggle Feature Flags",
    description: "Override JSON API responses for toggling feature flags",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704366820790,
        description: "Override JSON API responses for toggling feature flags",
        groupId: "",
        id: "Response_3xxx2",
        isSample: false,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        modificationDate: 1704366993356,
        name: "Toggle Feature Flags",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "hwm11",
            response: {
              resourceType: ResponseRule.ResourceType.REST_API,
              statusCode: "",
              type: ResponseRule.BodyType.STATIC,
              value: '{"featureFlag1":true,"featureFlag2":false,"featureFlag3":true}',
            },
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://api.example.com/features",
            },
          },
        ],
        ruleType: RuleType.RESPONSE,
        status: RecordStatus.INACTIVE,
      },
    },
  },
  {
    id: "8",
    name: "Mock Geolocation Header",
    description: "Simulate geolocation on specific websites.",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1704367701627,
        description: "Simulate geolocation on specific websites.",
        groupId: "",
        id: "Headers_a95vo",
        isSample: false,
        lastModifiedBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        currentOwner: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        createdBy: "tWxDQWeiZ7grxJvV8L4iX9e0w8s1",
        modificationDate: 1704367833216,
        name: "Mock Geolocation Header",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "s1lr1",
            modifications: {
              Request: [
                {
                  header: "X-Forwarded-For",
                  id: "abijp",
                  type: HeaderRule.ModificationType.ADD,
                  value: "203.0.113.195",
                },
                {
                  header: "CF-IPCountry",
                  id: "3qfpw",
                  type: HeaderRule.ModificationType.ADD,
                  value: "US",
                },
              ],
            },
            source: {
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "https://www.specificsite.com",
            },
          },
        ],
        ruleType: RuleType.HEADERS,
        status: RecordStatus.INACTIVE,
        version: 2,
      },
    },
  },
  {
    id: "9",
    name: "Redirect Google Queries to DuckDuckGo",
    description: "Turn it on and your chrome address bar will show results from DuckDuckGo",
    isSharedList: false,
    isFeatured: false,
    imageURL: "https://www.vectorlogo.zone/logos/duckduckgo/duckduckgo-icon.svg",
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643717688716,
        description: "Turn it on and your chrome address bar will show results from DuckDuckGo",
        groupId: "",
        id: "Redirect_mbdyf",
        isSample: false,
        name: "Redirect Google Queries to DuckDuckGo",
        objectType: RecordType.RULE,
        pairs: [
          {
            destination: "$1://duckduckgo.com/?q=$3&$4",
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.WILDCARD_MATCHES,
              value: "*://www.google.*/search?q=*&*",
            },
            id: "soktt",
          },
        ],
        ruleType: RuleType.REDIRECT,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643718041831,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "10",
    name: "Load Google Analytics in Debug Mode",
    description:
      "Prints useful information to the JavaScript console by enabling the debug version of the Google Analytics Javascript.",
    isSharedList: true,
    isFeatured: false,
    tags: ["Redirect", "Script"],
    imageURL: "https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg",
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      shareId: "1643984301107",
      sharedListName: "Load Google Analytics in Debug Mode",
    },
  },
  {
    id: "11",
    name: "Highlight Google Ads",
    description: "Highlights Ads in Google Search Result to avoid clicking on them",
    imageURL: "https://www.vectorlogo.zone/logos/google_ads/google_ads-icon.svg",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643752821159,
        description: "Highlights Ads in Google Search Result to avoid clicking on them",
        groupId: "",
        id: "Script_mq17e",
        isSample: false,
        name: "Highlight Google Ads",
        objectType: RecordType.RULE,
        pairs: [
          {
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "",
            },
            scripts: [
              {
                codeType: ScriptRule.ScriptType.JS,
                fileName: "",
                loadTime: ScriptRule.ScriptLoadTime.AFTER_PAGE_LOAD,
                type: ScriptRule.ScriptValueType.CODE,
                value:
                  "if(document.querySelector('#tvcap'))document.querySelector('#tvcap').style.background='#f8fcae'",
                id: "nu40j",
              },
            ],
            id: "0mard",
          },
        ],
        ruleType: RuleType.SCRIPT,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643753009682,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "12",
    name: "Browse Quora Anonymously",
    description: "Can load Quora in Incognito Mode without signing in",
    imageURL: "https://www.vectorlogo.zone/logos/quora/quora-icon.svg",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643723253038,
        description: "Can load Quora in Incognito Mode without signing in",
        groupId: "",
        id: "QueryParam_bwjbn",
        isSample: false,
        name: "Browse Quora Anonymously",
        objectType: RecordType.RULE,
        pairs: [
          {
            modifications: [
              {
                actionWhenParamExists: "Overwrite",
                param: "share",
                type: QueryParamRule.ModificationType.ADD,
                value: "1",
                id: "mlcns",
              },
            ],
            source: {
              filters: [
                {
                  resourceType: [ResourceType.MainDocument],
                },
              ],
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "quora.com",
            },
            id: "irgm4",
          },
        ],
        ruleType: RuleType.QUERYPARAM,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643723413510,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "13",
    name: "Remove UTM Params",
    description: "Turn it on and try opening example.com?utm_source=gmail",
    imageURL: "",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643986033516,
        description: "Turn it on and try opening example.com?utm_source=gmail",
        groupId: "",
        id: "QueryParam_az606",
        isSample: false,
        modificationDate: 1643987482731,
        name: "Remove UTM Params",
        objectType: RecordType.RULE,
        pairs: [
          {
            id: "ak6l0",
            // @ts-ignore
            modifications: [
              {
                actionWhenParamExists: "Overwrite",
                id: "pb9or",
                param: "utm_medium",
                type: "Remove",
                value: "",
              },
              {
                actionWhenParamExists: "Overwrite",
                id: "dczkx",
                param: "utm_source",
                type: "Remove",
                value: "",
              },
              {
                actionWhenParamExists: "Overwrite",
                id: "ydx5z",
                param: "utm_term",
                type: "Remove",
                value: "",
              },
              {
                actionWhenParamExists: "Overwrite",
                id: "i7vwu",
                param: "utm_campaign",
                type: "Remove",
                value: "",
              },
            ],
            source: {
              filters: [
                {
                  resourceType: [ResourceType.MainDocument],
                },
              ],
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.CONTAINS,
              value: "",
            },
          },
        ],
        ruleType: RuleType.QUERYPARAM,
        status: RecordStatus.INACTIVE,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "14",
    name: "Redirect Google Queries to Bing",
    description: "Turn it on and your chrome address bar will show results from Bing",
    imageURL: "https://www.vectorlogo.zone/logos/bing/bing-icon.svg",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643725370294,
        description: "Turn it on and your chrome address bar will show results from Bing",
        groupId: "",
        id: "Redirect_796qs",
        isSample: false,
        name: "Redirect Google Queries to Bing",
        objectType: RecordType.RULE,
        pairs: [
          {
            destination: "$1://bing.com/?q=$3&$4",
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.WILDCARD_MATCHES,
              value: "*://www.google.*/search?q=*&*",
            },
            id: "yi3r8",
          },
        ],
        ruleType: RuleType.REDIRECT,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643725511730,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
      },
    },
  },
  {
    id: "15",
    name: "Redirect Dictionary.com to Merriam-Webster in Adobe Acrobat Reader Lookup",
    description: "Change the Default Dictionary in Adobe Acrobat Reader to Merriam-Webster",
    imageURL: "https://www.vectorlogo.zone/logos/adobe_acrobat/adobe_acrobat-tile.svg",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643754671488,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        description: "Change the Default Dictionary in Adobe Acrobat Reader to Merriam-Webster",
        groupId: "",
        id: "Redirect_24doz",
        isSample: false,
        name: "Redirect Dictionary.com to Merriam-Webster in Adobe Acrobat Reader Lookup",
        objectType: RecordType.RULE,
        pairs: [
          {
            destination: "https://www.merriam-webster.com/dictionary/$1",
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.WILDCARD_MATCHES,
              value: "https://www.dictionary.com/browse/*",
            },
            id: "azvg0",
          },
        ],
        ruleType: RuleType.REDIRECT,
        status: RecordStatus.INACTIVE,
        modificationDate: 1643754728923,
      },
    },
  },
  {
    id: "16",
    name: "Redirect Dictionary.com to dict.cc in Adobe Acrobat Reader Lookup",
    description: "Change the Default Dictionary in Adobe Acrobat Reader to Multilingual dictionary",
    imageURL: "https://www.vectorlogo.zone/logos/adobe_acrobat/adobe_acrobat-tile.svg",
    isSharedList: false,
    isFeatured: false,
    data: {
      targetAppMode: ["EXTENSION", "DESKTOP"],
      ruleDefinition: {
        creationDate: 1643757615673,
        description: "Change the Default Dictionary in Adobe Acrobat Reader to Multilingual dictionary",
        groupId: "",
        id: "Redirect_uhm4d",
        isSample: false,
        lastModifiedBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        createdBy: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        currentOwner: "7px5zooOVjOHfAyGFMetTrrrzsg1",
        modificationDate: 1643758451249,
        name: "Redirect Dictionary.com to dict.cc in Adobe Acrobat Reader Lookup",
        objectType: RecordType.RULE,
        pairs: [
          {
            destination: "https://www.dict.cc/?s=$1",
            id: "w679g",
            source: {
              filters: null,
              key: RuleSourceKey.URL,
              operator: RuleSourceOperator.WILDCARD_MATCHES,
              value: "https://www.dictionary.com/browse/*",
            },
          },
        ],
        ruleType: RuleType.REDIRECT,
        status: RecordStatus.INACTIVE,
      },
    },
  },
];

export default templateRecords;
