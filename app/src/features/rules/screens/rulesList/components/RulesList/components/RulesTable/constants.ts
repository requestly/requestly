import LINKS from "config/constants/sub/links";
import { RuleType } from "types";
import { RuleDetails } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";

export const sampleRuleDetails: Record<string, { id: string; demoLink: string; details: RuleDetails }> = {
  OUz7jnsyudGhmAW2U6vy: {
    id: "OUz7jnsyudGhmAW2U6vy",
    demoLink: "https://requestly-demo-website-frontend.vercel.app/?rq-category=inject-scripts",
    details: {
      type: RuleType.SCRIPT,
      name: "Inject Scripts",
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
