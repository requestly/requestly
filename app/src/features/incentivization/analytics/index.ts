import { trackEvent } from "modules/analytics";
import { INCENTIVIZATION } from "./constants";
import { IncentivizeEvent } from "../types";

export const trackIncentivizationChecklistModalViewed = (source: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CHECKLIST_MODAL_VIEWED, source);
};

export const trackIncentivesScreenViewed = (source: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVES_SCREEN_VIEWED, { source });
};

export const trackIncentivizationTaskClicked = (task: IncentivizeEvent) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_TASK_CLICKED, { task });
};

export const trackIncentivizationChecklistTaskViewed = (task: IncentivizeEvent) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CHECKLIST_TASK_VIEWED, { task });
};

export const trackRedeemCreditsModalViewed = (num_credits: number, source: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_REDEEM_CREDITS_MODAL_VIEWED, { num_credits, source });
};

export const trackRedeemCreditsClicked = (num_credits: number) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_REDEEM_CREDITS_CLICKED, { num_credits });
};

export const trackCreditsRedeemed = (num_credits: number) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CREDITS_REDEEMED, { num_credits });
};

export const trackRedeemCreditsFailed = (reason: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CREDITS_REDEEM_FAILED, { reason });
};

export const trackNoCreditsAvailableModalViewed = (source: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_NO_CREDITS_AVAILABLE_MODAL_VIEWED, { source });
};

export const trackCreditsAssignedModalViewed = (
  num_credits: number,
  task: IncentivizeEvent,
  metadata: Record<string, unknown> = {}
) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CREDITS_ASSIGNED_MODAL_VIEWED, { num_credits, task, metadata });
};

export const trackCreditsAssignedModalClicked = (action: string) => {
  trackEvent(INCENTIVIZATION.INCENTIVIZATION_CREDITS_ASSIGNED_MODAL_CLICKED, { action });
};
