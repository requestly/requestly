import { trackEvent } from "modules/analytics";
import { SUPPORT_OPTION } from "./constants";

const trackSupportOptionClicked = (type: string) => {
  trackEvent(SUPPORT_OPTION.CLICKED, {
    type,
  });
};

const trackSlackConnectClicked = (source: string) => {
  trackEvent(SUPPORT_OPTION.JOIN_SLACK_CLICKED, {
    source,
  });
};

const trackSupportOptionOpened = () => {
  trackEvent(SUPPORT_OPTION.OPENED);
};

const trackSlackButtonVisible = () => {
  trackEvent(SUPPORT_OPTION.SLACK_CONNECT_VISIBLE);
};

export { trackSupportOptionClicked, trackSlackConnectClicked, trackSupportOptionOpened, trackSlackButtonVisible };
