import { trackEvent } from "modules/analytics";
import { REQUEST_BOT } from "./constants";

export const trackAskAIClicked = () => {
  trackEvent(REQUEST_BOT.ASK_AI_CLICKED);
};

export const trackGetHumanSupportClicked = () => {
  trackEvent(REQUEST_BOT.GET_HUMAN_SUPPORT_CLICKED);
};
