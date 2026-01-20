import { trackEvent } from "modules/analytics";
import { REQUEST_BOT } from "./constants";

export const trackAskAIClicked = (source: "rule_sidebar" | "rules_empty_state" | "app_header") => {
  const params = { source };
  trackEvent(REQUEST_BOT.ASK_AI_CLICKED, params);
};

export const trackGetHumanSupportClicked = () => {
  trackEvent(REQUEST_BOT.GET_HUMAN_SUPPORT_CLICKED);
};
