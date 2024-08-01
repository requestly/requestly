import LINKS from "config/constants/sub/links";
import { RuleType } from "types";
import { RuleDetails } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";
// // PROD
// const sampleRuleTemplateIds = [
//   "9ywxyfxsaaVbfBAJN24f",
//   "BpDkxdUAdbSdOJLriwxp",
//   "G2EXbUD9B2QiOhgsrtHl",
//   "OqFoyPdEUPnQrBEkqjxR",
//   "bSEtct1DF1Xgn1Y7okas",
//   "jR46qxwfXEMT9SrPzC8L",
//   "z6FShnq5xbbnAu8H4JS0",
// ];

// LOCAL
export const sampleRuleDetails: Record<string, { id: string; demoLink: string; details: RuleDetails }> = {
  "9ywxyfxsaaVbfBAJN24f": {
    id: "9ywxyfxsaaVbfBAJN24f",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=inject-scripts",
    details: {
      type: RuleType.SCRIPT,
      name: "Inject Scripts",
      description: "The Insert Script rule allows you to inject custom JavaScript or styles into any website. ",
      useCases: [
        {
          useCase: "With this rule, the background of the items is changed by injecting custom CSS.",
          suggestedTemplateId: "",
        },
        {
          useCase: "Toggle the rule on and off and reload the website to observe the differences.",
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_SCRIPT_RULE_DOCS,
    },
  },
  BpDkxdUAdbSdOJLriwxp: {
    id: "BpDkxdUAdbSdOJLriwxp",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=override-api-response-graphql",
    details: {
      type: RuleType.RESPONSE,
      name: "Override GraphQL API Response",
      description: "The Modify Response rule allows overriding existing GraphQL responses.",
      useCases: [
        {
          useCase:
            "For all requests containing operationName = Products, we override the existing responses with a specific one. As a result, all product responses will display details as if they were apples, showing apple inventory information.",
          suggestedTemplateId: "",
        },
        {
          useCase: "Toggle the rule on and off and reload the website to observe the differences.",
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  G2EXbUD9B2QiOhgsrtHl: {
    id: "G2EXbUD9B2QiOhgsrtHl",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=redirect",
    details: {
      type: RuleType.REDIRECT,
      name: "Redirect URL to another URL",
      description:
        "The Redirect Rule changes the HTTP request location to a new destination, serving the response from the new location transparently.",
      useCases: [
        {
          useCase:
            "With this rule, we redirect the API that fetches bakery items to the one that fetches gadgets and electronic items.",
          suggestedTemplateId: "",
        },
        {
          useCase: "This changes the listed items in the store from juices and bread to gaming consoles and computers.",
          suggestedTemplateId: "",
        },
        {
          useCase: "Toggle the rule on and off and reload the website to observe the differences.",
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_REDIRECT_RULE_DOCS,
    },
  },
  OqFoyPdEUPnQrBEkqjxR: {
    id: "OqFoyPdEUPnQrBEkqjxR",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=modify-http-status-code-rest",
    details: {
      type: RuleType.RESPONSE,
      name: "Modify HTTP Status Code",
      description: "The Modify Response rule allows overriding the status code of existing API responses. ",
      useCases: [
        {
          useCase:
            "Instead of the regular responses, we'll be overriding the response code with 404. As a result, the products will continue loading indefinitely on the site.",
          suggestedTemplateId: "",
        },
        {
          useCase: "Toggle the rule on and off and reload the website to observe the differences.",
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
  bSEtct1DF1Xgn1Y7okas: {
    id: "bSEtct1DF1Xgn1Y7okas",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=replace",
    details: {
      type: RuleType.REPLACE,
      name: "Replace a part of the URL",
      description: "The Replace Rule allows replacing a particular string in the URL with the desired string.",
      useCases: [
        {
          useCase: `In the playground, an API initially requested a list of bakery items, but we want a list of grocery items instead. By applying the Replace Rule, the category is switched from "bakery" to "grocery."`,
          suggestedTemplateId: "",
        },
        {
          useCase: `This changes the listed items from juices and bread to fruits and vegetables.`,
          suggestedTemplateId: "",
        },
        {
          useCase: `Toggle the rule on and off and reload the website to observe the differences.`,
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_REPLACE_RULE_DOCS,
    },
  },
  jR46qxwfXEMT9SrPzC8L: {
    id: "jR46qxwfXEMT9SrPzC8L",
    demoLink: "",
    details: {
      type: "",
      name: "",
      description: "",
      useCases: [{ useCase: "", suggestedTemplateId: "" }],
      documentationLink: "",
    },
  },
  z6FShnq5xbbnAu8H4JS0: {
    id: "z6FShnq5xbbnAu8H4JS0",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=override-api-response-rest",
    details: {
      type: RuleType.RESPONSE,
      name: "Override REST API Response",
      description:
        "The Modify Response rule allows overriding existing API responses. In this example, we modify the API response that provides product descriptions.",
      useCases: [
        {
          useCase: `Click on “Try this rule” to go to the playground and check the listed items. You will notice the descriptions of each item have changed.`,
          suggestedTemplateId: "",
        },
        {
          useCase: `Toggle the rule on and off and reload the website to observe the differences.`,
          suggestedTemplateId: "",
        },
      ],
      documentationLink: LINKS.REQUESTLY_RESPONSE_RULE_DOCS,
    },
  },
};
