import { trackEvent } from "modules/analytics";
import { PRICING_MODAL, PRICING_WORKSPACE } from "./constants";

export const trackPricingModalPlansViewed = () => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_PLANS_VIEWED);
};

export const trackPricingWorkspaceSwitched = (selection: "team" | "individual", source: string) => {
  trackEvent(PRICING_WORKSPACE.PRICING_WORKSPACE_SWITCHED, { selection, source });
};

export const trackPricingModalStripeWindowOpened = () => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_STRIPE_WINDOW_OPENED);
};
