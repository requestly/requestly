import { useSelector } from "react-redux";
import { getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { featureLimits } from "./featureLimitTypes";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { FeatureLimitType } from "./types";
import { getPlanNameFromId } from "utils/PremiumUtils";
import { PRICING } from "features/pricing";

const premiumPlansToCheckLimit = [PRICING.PLAN_NAMES.LITE, PRICING.PLAN_NAMES.BASIC, PRICING.PLAN_NAMES.BASIC_V2];

export const useFeatureLimiter = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const isUserPremium = user?.details?.isPremium;
  const userPlan = isUserPremium ? getPlanNameFromId(user?.details?.planDetails?.planId) : PRICING.PLAN_NAMES.FREE;

  const checkFeatureLimits = () => {
    if (isUserPremium && !premiumPlansToCheckLimit.includes(userPlan)) {
      if (user.isLimitReached) {
        dispatch(globalActions.updateUserLimitReached(false));
      }
      return;
    }

    const isLimitExceeded = Object.values(FeatureLimitType).some((featureLimitType) =>
      checkIfFeatureLimitReached(featureLimitType, "breached")
    );
    dispatch(globalActions.updateUserLimitReached(isLimitExceeded));
  };

  const checkIfFeatureLimitReached = (featureLimitType: FeatureLimitType, checkType: "breached" | "reached") => {
    const currentFeatureValue = getFeatureCurrentValue(featureLimitType);
    const featureLimitValue = getFeatureLimitValue(featureLimitType);
    if (checkType === "breached") return currentFeatureValue > featureLimitValue;
    else return currentFeatureValue >= featureLimitValue;
  };

  const getFeatureCurrentValue = (featureLimitType: FeatureLimitType) => {
    switch (featureLimitType) {
      case FeatureLimitType.num_rules:
        return userAttributes?.num_rules;
      case FeatureLimitType.num_active_rules:
        return userAttributes?.num_active_rules;
    }
  };

  const getFeatureLimitValue = (featureLimitType: FeatureLimitType) => {
    if (!(featureLimitType in FeatureLimitType)) return true; // free feature

    if (isUserPremium && !premiumPlansToCheckLimit.includes(userPlan)) return Infinity;

    return (
      featureLimits[userPlan]?.[featureLimitType] ?? featureLimits[PRICING.PLAN_NAMES.BASIC_V2]?.[featureLimitType] // if plan is not found, return basic plan limit eg: for lite plan
    );
  };

  const getIsFeatureEnabled = (featureLimitType: FeatureLimitType) => {
    return (
      featureLimits[userPlan]?.[featureLimitType] ?? featureLimits[PRICING.PLAN_NAMES.BASIC_V2]?.[featureLimitType]
    );
  };

  return {
    checkFeatureLimits,
    getFeatureLimitValue,
    getIsFeatureEnabled,
    checkIfFeatureLimitReached,
  };
};
