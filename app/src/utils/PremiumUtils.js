//CONSTANTS
import { PRICING } from "features/pricing";

export const getPlanNameFromId = (planId) => {
  if (!planId) return null;
  const planName = planId.split("_")[0];

  switch (planName) {
    case PRICING.PLAN_NAMES.BASIC:
      return PRICING.PLAN_NAMES.BASIC;
    case PRICING.PLAN_NAMES.PROFESSIONAL:
      return PRICING.PLAN_NAMES.PROFESSIONAL;
    case PRICING.PLAN_NAMES.GOLD:
      return PRICING.PLAN_NAMES.PROFESSIONAL;
    case PRICING.PLAN_NAMES.LITE:
      return PRICING.PLAN_NAMES.LITE;
    case PRICING.PLAN_NAMES.BASIC_V2:
      return PRICING.PLAN_NAMES.BASIC_V2;
    case PRICING.PLAN_NAMES.ENTERPRISE:
      return PRICING.PLAN_NAMES.ENTERPRISE;
    case PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE:
      return PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE;
    case PRICING.PLAN_NAMES.SESSION_FREE:
      return PRICING.PLAN_NAMES.SESSION_FREE;
    default:
      return PRICING.PLAN_NAMES.PROFESSIONAL;
  }
};

export const isPremiumPlan = (planId) => {
  if (!planId) return false;
  const planName = planId.split("_")[0];

  if (PRICING.PREMIUM_PLANS.includes(planName)) return true;

  return false;
};

export const isPlanExpired = (planDetails) => {
  if (!planDetails || !planDetails.subscription) {
    return true;
  }

  let endDate = planDetails.subscription.endDate;

  // Handle Backward Compatibility (Initially we saved current_period_end in the sub object (e.g. 1585497103.984)
  if (planDetails.subscription.current_period_end) {
    endDate = new Date(planDetails.subscription.current_period_end * 1000).toLocaleDateString("en-CA");
  }

  return endDate < new Date().toISOString().split("T")[0];
};

export const isPremiumUser = (userPlanDetails) => {
  if (!userPlanDetails) {
    return false;
  }

  // Handle Case - Status node is not there in referral type
  if (userPlanDetails.type === "referral") {
    return isPremiumPlan(userPlanDetails.planId) && !isPlanExpired(userPlanDetails);
  }

  // For all other types eg Unlock, Team, Individual, Paypal
  return (
    ["active", "trialing", "past_due"].includes(userPlanDetails.status) &&
    isPremiumPlan(userPlanDetails.planId) &&
    !isPlanExpired(userPlanDetails)
  );
};

export const getPlanName = (planDetails) => {
  if (!planDetails || !planDetails.planId || !planDetails.subscription) {
    return PRICING.PLAN_NAMES.FREE;
  }

  if (!isPremiumUser(planDetails) && isPremiumPlan(planDetails.planId)) {
    return PRICING.PLAN_NAMES.FREE;
  }

  if (planDetails.planId === PRICING.PLAN_NAMES.BASIC_V2) {
    return PRICING.PLAN_NAMES.BASIC;
  }

  if (planDetails.planId) {
    return getPlanNameFromId(planDetails.planId);
  }

  return PRICING.PLAN_NAMES.FREE;
};

export const isBasicPlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === PRICING.PLAN_NAMES.BASIC;
};

export const isProfessionalPlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === PRICING.PLAN_NAMES.PROFESSIONAL;
};

export const isEnterprisePlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === PRICING.PLAN_NAMES.ENTERPRISE;
};

export const isTrialPlan = (planType) => {
  return planType?.toLowerCase() === PRICING.CHECKOUT.MODES.TRIAL;
};

export const getEndDate = (planDetails) => {
  if (!planDetails || !planDetails.subscription) {
    return null;
  }

  let endDate = planDetails.subscription.endDate;

  // Handle Backward Compatibility (Initially we saved current_period_end in the sub object (e.g. 1585497103.984)
  if (planDetails.subscription.current_period_end) {
    endDate = new Date(planDetails.subscription.current_period_end * 1000).toISOString().split("T")[0];
  }

  return endDate;
};

export const getTeamPlanNameFromId = (planId) => {
  const planName = getPlanNameFromId(planId);
  switch (planName) {
    case PRICING.PLAN_NAMES.BASIC:
      return PRICING.PLAN_NAMES.BASIC_ENTERPRISE;
    case PRICING.PLAN_NAMES.PROFESSIONAL:
      return PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE;
    default:
      return PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE;
  }
};

/**
 * Only checks for expiration of trial plan for all other plans we have isPlanExpired()
 * @param {Object} planDetails
 * @returns Boolean
 */
export const isTrialPlanExpired = (planDetails) => {
  if (!planDetails) {
    return false;
  }

  if (!isTrialPlan(planDetails?.type)) {
    return false;
  }

  let endDate = planDetails.subscription.endDate;

  // Handle Backward Compatibility (Initially we saved current_period_end in the sub object (e.g. 1585497103.984)
  if (planDetails.subscription.current_period_end) {
    endDate = new Date(planDetails.subscription.current_period_end * 1000).toLocaleDateString("en-CA");
  }

  return endDate < new Date().toLocaleDateString("en-CA");
};
