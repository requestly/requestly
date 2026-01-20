import { trackEvent } from "modules/analytics";
import { REDIRECT_DESTINATION_OPTION } from "../constants";

export const trackClickMapLocalFile = () => {
  const params = {
    type: REDIRECT_DESTINATION_OPTION.TYPE.FILE,
  };
  trackEvent(REDIRECT_DESTINATION_OPTION.CLICKED, params);
};

export const trackSelectMapLocalFile = (filePath) => {
  const params = {
    type: REDIRECT_DESTINATION_OPTION.TYPE.FILE,
    value: filePath,
  };
  trackEvent(REDIRECT_DESTINATION_OPTION.SELECTED, params);
};

export const trackClickMock = () => {
  const params = {
    type: REDIRECT_DESTINATION_OPTION.TYPE.MOCK,
  };
  trackEvent(REDIRECT_DESTINATION_OPTION.CLICKED, params);
};

export const trackSelectMock = (mockUrl) => {
  const params = {
    type: REDIRECT_DESTINATION_OPTION.TYPE.MOCK,
    value: mockUrl,
  };
  trackEvent(REDIRECT_DESTINATION_OPTION.CLICKED, params);
};
