import { trackEvent } from "modules/analytics";
import { BILLING_TEAM_NUDGE } from "./constants";

export const trackBillingTeamNudgeViewed = () => {
  trackEvent(BILLING_TEAM_NUDGE.BILLING_TEAM_NUDGE_VIEWED);
};

export const trackBillingTeamNudgeClosed = () => {
  trackEvent(BILLING_TEAM_NUDGE.BILLING_TEAM_NUDGE_CLOSED);
};

export const trackBillingTeamNudgeRequestSent = () => {
  trackEvent(BILLING_TEAM_NUDGE.BILLING_TEAM_NUDGE_REQUEST_SENT);
};

export const trackBillingTeamNudgeRequestFailed = () => {
  trackEvent(BILLING_TEAM_NUDGE.BILLING_TEAM_NUDGE_REQUEST_FAILED);
};

export const trackCheckoutBillingTeamNudgeClicked = () => {
  trackEvent(BILLING_TEAM_NUDGE.CHECKOUT_BILLING_TEAM_NUDGE_CLICKED);
};
