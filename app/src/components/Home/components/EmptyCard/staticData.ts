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
      "Map local files or redirect API/JS requests between environments..",
      "Mock XHR & Fetch requests by stubbing API responses.",
      "Modify URLs or swap hosts/domains.",
      "Customize request and response headers.",
      "Inject custom JavaScript or CSS into any website.",
    ],
    playIcon: {
      src: PlayIconRules,
      label: "See in action ",
      url: "https://www.youtube.com/playlist?list=PLmHjVvTu_7ddFIIT9AkZ7p0lrC5gBuyb6",
    },
  },
  API_CLIENT: {
    title: "API client",
    description: "Design, manage, and test APIs easily",
    icon: apiClientIcon,
    features: [
      "Send API requests and test endpoints effortlessly.",
      "Execute cURL requests directly in the client.",
      "Organize requests into collections.",
      "Use environments and variables for dynamic testing.",
      "Collaborate seamlessly in team workspaces.",
    ],
    playIcon: {
      src: PlayIconApi,
      label: "See in action ",
      url: "https://www.youtube.com/watch?v=xrqmAffe86k",
    },
  },
};
