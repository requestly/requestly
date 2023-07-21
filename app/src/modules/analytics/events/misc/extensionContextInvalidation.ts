import { trackEvent } from "modules/analytics";
import { EXTENSION_CONTEXT_INVALIDATED } from "./constants";

export const trackExtensionContextInvalidated = (oldVersion: string, newVersion: string) => {
  trackEvent(EXTENSION_CONTEXT_INVALIDATED, { oldVersion, newVersion });
};
