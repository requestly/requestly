import { trackEvent } from "modules/analytics";
import { TUTORIALS_CLICKED } from "./constants";

export const trackTutorialsClicked = () => {
  trackEvent(TUTORIALS_CLICKED);
};
