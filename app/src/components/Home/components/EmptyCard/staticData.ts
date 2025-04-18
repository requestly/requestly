import PlayIconRules from "../../../../assets/images/gifs/play-rules.gif";
import PlayIconApi from "../../../../assets/images/gifs/play-api.gif";
import { trackHomeApisActionClicked, trackHomeRulesActionClicked } from "components/Home/analytics";
import { CardType } from "../Card/types";

export const PRODUCT_FEATURES = {
  [CardType.RULES]: {
    title: "HTTP Interceptor",
    description: "Intercept, debug and modify HTTP requests",
    icon: "/assets/media/rules/rules-icon.svg",
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
      url: "https://rqst.ly/http-rules-yt-tutorials",
      onClick: () => trackHomeRulesActionClicked("see_in_action"),
    },
  },
  [CardType.API_CLIENT]: {
    title: "API client",
    description: "Design, manage, and test APIs easily",
    icon: "/assets/media/apiClient/api-client-icon.svg",
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
      url: "https://rqst.ly/api-client-intro-yt",
      onClick: () => trackHomeApisActionClicked("see_in_action"),
    },
  },
};
