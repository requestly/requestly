//CONSTANTS
import APP_CONSTANTS from "../config/constants";

export const getPlanNameFromId = (planId) => {
  if (!planId) return null;
  const planName = planId.split("_")[0];

  switch (planName) {
    case APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC;
    case APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL;
    case APP_CONSTANTS.PRICING.PLAN_NAMES.GOLD:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL;
    case APP_CONSTANTS.PRICING.PLAN_NAMES.LITE:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC;
    default:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL;
  }
};

export const isPremiumPlan = (planId) => {
  if (!planId) return false;
  const planName = planId.split("_")[0];

  if (APP_CONSTANTS.PRICING.PREMIUM_PLANS.includes(planName)) return true;

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
    userPlanDetails.status === "active" && isPremiumPlan(userPlanDetails.planId) && !isPlanExpired(userPlanDetails)
  );
};

export const getPlanName = (planDetails) => {
  if (!planDetails || !planDetails.planId || !planDetails.subscription) {
    return APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;
  }

  if (isPlanExpired(planDetails)) {
    return APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;
  }

  if (planDetails.planId) {
    return getPlanNameFromId(planDetails.planId);
  }

  return APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;
};

export const isBasicPlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC;
};

export const isProfessionalPlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL;
};

export const isEnterprisePlan = (planId) => {
  if (!planId) return false;

  return getPlanNameFromId(planId) === APP_CONSTANTS.PRICING.PLAN_NAMES.ENTERPRISE;
};

export const isTrialPlan = (planType) => {
  return planType?.toLowerCase() === APP_CONSTANTS.PRICING.CHECKOUT.MODES.TRIAL;
};

export const getPlanHeader = (planId) => {
  if (!planId) return " ";
  const planName = getPlanNameFromId(planId);

  return APP_CONSTANTS.PRICING.PLAN_HEADERS[planName] || " ";
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
    case APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC_ENTERPRISE;
    case APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE;
    default:
      return APP_CONSTANTS.PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE;
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
