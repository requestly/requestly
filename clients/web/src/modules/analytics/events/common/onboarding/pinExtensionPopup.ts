import { trackEvent } from "modules/analytics";
import { ONBOARDING } from "../constants";

export type PinExtensionCollapseExpandedAction =
  | "activate_deactivate"
  | "what_rules_executed"
  | "record_and_replay"
  | "pause_extension";

type PinExtensionPopupClosed = "close" | "already_pinned";

export const trackPinExtensionPopupViewed = () => {
  trackEvent(ONBOARDING.PIN_EXTENSION_POPUP_VIEWED);
};

export const trackPinExtensionPopupExpanded = (action: PinExtensionCollapseExpandedAction) => {
  const params = { action };
  trackEvent(ONBOARDING.PIN_EXTENSION_POPUP_EXPANDED, params);
};

export const trackPinExtensionPopupClosed = (action: PinExtensionPopupClosed) => {
  const params = { action };
  trackEvent(ONBOARDING.PIN_EXTENSION_POPUP_CLOSED, params);
};
