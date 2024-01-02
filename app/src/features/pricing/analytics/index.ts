import { trackEvent } from "modules/analytics";
import { PRICING_MODAL, PRICING_WORKSPACE } from "./constants";

export const trackPricingModalPlansViewed = (source: string) => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_PLANS_VIEWED, { source });
};

export const trackPricingWorkspaceSwitched = (selection: "team" | "individual", source: string) => {
  trackEvent(PRICING_WORKSPACE.PRICING_WORKSPACE_SWITCHED, { selection, source });
};

export const trackPricingModalStripeWindowOpened = (source: string) => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_STRIPE_WINDOW_OPENED, { source });
};
