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
      "Monitor HTTP requests and responses",
      "Map local files or redirect URLs",
      "Modify XHR or Fetch responses",
      "Customize request and response headers",
      "Update hostnames or URL strings",
    ],
    playIcon: {
      src: PlayIconRules,
      label: "See in action ",
      url: "https://rqst.ly/http-rules-yt-tutorials",
      onClick: () => trackHomeRulesActionClicked("see_in_action"),
    },
  },
  [CardType.API_CLIENT]: {
    title: "API Client",
    description: "Design, manage, and test APIs easily",
    icon: "/assets/media/apiClient/api-client-icon.svg",
    features: [
      "Send and test API requests",
      "Execute cURL requests",
      "Start with pre-built example collections",
      "Import API end-points from cURL",
      "Import from Postman and Insomnia",
    ],
    playIcon: {
      src: PlayIconApi,
      label: "See in action ",
      url: "https://rqst.ly/api-client-intro-yt",
      onClick: () => trackHomeApisActionClicked("see_in_action"),
    },
  },
  [CardType.API_MOCKING]: {
    title: "API Mocking",
    description: "",
    icon: "/assets/media/common/api-mocking.svg",
    features: [
      "Modify API responses",
      "Modify API request body",
      "Modify HTTP Status Code",
      "Create Mock Endpoints",
      "Supports GraphQL API Overrides",
    ],
    playIcon: {
      src: PlayIconApi,
      label: "See in action ",
      url: "https://www.youtube.com/watch?v=1en9NAeEk8A",
      onClick: () => trackHomeApisActionClicked("see_in_action"),
    },
  },
};
