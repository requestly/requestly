import { useSelector } from "react-redux";
import { getUserAttributes, getUserAuthDetails } from "store/selectors";
import { featureLimits } from "./featureLimitTypes";
import { useDispatch } from "react-redux";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { FeatureLimitType } from "./types";

const premiumPlansToCheckLimit = [APP_CONSTANTS.PRICING.PLAN_NAMES.LITE, APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC];

export const useFeatureLimiter = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const isUserPremium = user?.details?.isPremium;
  const userPlan = user?.details?.planDetails?.planName ?? APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;

  const checkFeatureLimits = () => {
    if (isUserPremium && !premiumPlansToCheckLimit.includes(userPlan)) {
      if (user.isLimitReached) {
        dispatch(actions.updateUserLimitReached(false));
      }
      return;
    }

    const isLimitReached = Object.values(FeatureLimitType).some((featureLimitType) =>
      checkIfFeatureLimitBreached(featureLimitType)
    );
    dispatch(actions.updateUserLimitReached(isLimitReached));
  };

  const checkIfFeatureLimitBreached = (featureLimitType: FeatureLimitType, currentValue?: number) => {
    const currentFeatureValue = currentValue || getFeatureCurrentValue(featureLimitType);
    const featureLimitValue = getFeatureLimitValue(featureLimitType);

    return currentFeatureValue > featureLimitValue;
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
    return (
      featureLimits[userPlan]?.[featureLimitType] ??
      featureLimits[APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]?.[featureLimitType] // if plan is not found, return basic plan limit eg: for lite plan
    );
  };

  const getIsFeatureEnabled = (featureLimitType: FeatureLimitType) => {
    return (
      featureLimits[userPlan]?.[featureLimitType] ??
      featureLimits[APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC]?.[featureLimitType]
    );
  };

  return {
    checkFeatureLimits,
    getFeatureLimitValue,
    getIsFeatureEnabled,
  };
};
