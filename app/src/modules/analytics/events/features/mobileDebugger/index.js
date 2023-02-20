import { trackEvent } from "modules/analytics";
import { MOBILE_DEBUGGER } from "../constants";

export const trackSdkKeyCreatedEvent = (sdk_key, app_name, platform_id) => {
  const params = {
    sdk_key,
    app_name,
    platform_id,
  };
  trackEvent(MOBILE_DEBUGGER.SDK_KEY_CREATED, params);
};

export const trackSdkKeyCreatedFailureEvent = () => {
  trackEvent(MOBILE_DEBUGGER.SDK_KEY_CREATED_FAILURE);
};

export const trackDeviceIdSelectedEvent = () => {
  trackEvent(MOBILE_DEBUGGER.DEVICE_ID_SELECTED);
};

export const trackDeviceIdSelectedFailureEvent = () => {
  trackEvent(MOBILE_DEBUGGER.DEVICE_ID_SELECTED_FAILURE);
};

export const trackAndroidDebuggerShareClicked = () => {
  trackEvent(MOBILE_DEBUGGER.SHARE_CLICKED);
};

export const trackAndroidDebuggerShared = () => {
  trackEvent(MOBILE_DEBUGGER.SHARED);
};
