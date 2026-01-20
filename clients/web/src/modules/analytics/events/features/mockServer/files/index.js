import { trackEvent } from "modules/analytics";
import { MOCK_SERVER } from "../../constants";

// TODO: cleanup
export const trackCreateFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.CREATED, params);
};

export const trackUpdateFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.UPDATED, params);
};

export const trackDeleteFileEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.FILES.DELETED, params);
};
