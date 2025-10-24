import { trackEvent } from "modules/analytics";
import { MOCK_SERVER } from "../../constants";

// TODO: cleanup
export const trackCreateMockEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.MOCKS.CREATED, params);
};

export const trackUpdateMockEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.MOCKS.UPDATED, params);
};

export const trackDeleteMockEvent = () => {
  const params = {};
  trackEvent(MOCK_SERVER.MOCKS.DELETED, params);
};
