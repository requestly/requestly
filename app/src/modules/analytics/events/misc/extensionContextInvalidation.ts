import { trackEvent } from "modules/analytics";
import { EXTENSION_CONTEXT_INVALIDATION } from "./constants";

export const trackExtensionContextInvalidated = (oldVersion: string, newVersion: string) => {
  trackEvent(EXTENSION_CONTEXT_INVALIDATION.MESSAGE_SEEN, { oldVersion, newVersion });
};

export const trackAppReloadedFromMessage = () => {
  trackEvent(EXTENSION_CONTEXT_INVALIDATION.APP_RELOADED_FROM_MESSAGE);
};
