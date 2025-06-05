import { trackEvent } from "modules/analytics";
import { PRICING_MODAL, PRICING_STUDENT_PROGRAM, PRICING_WORKSPACE } from "./constants";

export const trackPricingModalPlansViewed = (source: string) => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_PLANS_VIEWED, { source });
};

export const trackPricingWorkspaceSwitched = (selection: "team" | "individual", source: string) => {
  trackEvent(PRICING_WORKSPACE.PRICING_WORKSPACE_SWITCHED, { selection, source });
};

export const trackPricingModalStripeWindowOpened = (source: string) => {
  trackEvent(PRICING_MODAL.PRICING_MODAL_STRIPE_WINDOW_OPENED, { source });
};

export const trackPricingPlansQuantityChanged = (quantity: number, planName: string, source: string) => {
  const params = {
    quantity,
    source,
    plan_name: planName,
  };
  trackEvent(PRICING_MODAL.PRICING_PLANS_QUANTITY_CHANGED, params);
};

export const trackGetFreeTrialClicked = (source: string) => {
  const params = { source };
  trackEvent(PRICING_STUDENT_PROGRAM.PRICING_GET_FREE_TRIAL_CLICKED, params);
};

export const trackStudentProgramClicked = (source: string) => {
  const params = { source };
  trackEvent(PRICING_STUDENT_PROGRAM.PRICING_STUDENT_PROGRAM_CLICKED, params);
};
