import rulesIcon from "../RulesCard/assets/rules-icon.svg";
import apiClientIcon from "../ApiClientCard/assets/api-client-icon.svg";
import PlayIconRules from "../RulesCard/assets/play-rules.gif";
import PlayIconApi from "../ApiClientCard/assets/play-api.gif";

export const PRODUCT_FEATURES = {
  RULES: {
    title: "HTTP Interceptor",
    description: "Intercept, debug and modify HTTP requests",
    icon: rulesIcon,
    features: [
      "Monitor HTTP/S requests and responses easily.",
      "Map local files or redirect URLs.",
      "Modify XHR or Fetch responses quickly.",
      "Customize request and response headers.",
      "Update hostnames or modify URL strings.",
    ],
    playIcon: {
      src: PlayIconRules,
      label: "See in action ",
      time: "(2 mins)",
    },
  },
  API_CLIENT: {
    title: "API client",
    description: "Design, manage, and test APIs easily",
    icon: apiClientIcon,
    features: [
      "Send API requests and test endpoints easily.",
      "Execute cURL requests directly in the client.",
      "Explore pre-built example collections quickly.",
      "Import API end-points from cURL",
      "One-click import from Postman and Insomnia",
    ],
    playIcon: {
      src: PlayIconApi,
      label: "See in action ",
      time: "(4 mins)",
    },
  },
};
