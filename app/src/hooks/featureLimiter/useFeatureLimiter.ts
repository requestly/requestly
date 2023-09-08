import { useSelector } from "react-redux";
import { getUserAttributes, getUserAuthDetails } from "store/selectors";
import { FeatureLimitType, featureLimits } from "./featureLimitTypes";
import { useDispatch } from "react-redux";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";

export const useFeatureLimiter = () => {
  const dispatch = useDispatch();
  const userAttributes = useSelector(getUserAttributes);
  const user = useSelector(getUserAuthDetails);

  const isUserPremium = user?.details?.isPremium;
  const isUserLoggedIn = user?.loggedIn;
  const userPlan = user?.details?.planDetails?.planName ?? APP_CONSTANTS.PRICING.PLAN_NAMES.FREE;

  const checkFeatureLimits = () => {
    if (!isUserLoggedIn) {
      return;
    }

    if (isUserPremium && userPlan !== APP_CONSTANTS.PRICING.PLAN_NAMES.BASIC) {
      return;
    }

    const isLimitReached = Object.values(FeatureLimitType).some((featureLimitType) =>
      checkIfFeatureLimitBreached(featureLimitType)
    );

    if (isLimitReached) {
      dispatch(actions.updateUserLimitReached(true));
    }
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
    console.log("!!!debug", "", user);
    return featureLimits[userPlan][featureLimitType];
  };

  const getIsFeatureEnabled = (featureLimitType: FeatureLimitType) => {
    return featureLimits[userPlan][featureLimitType];
  };

  return {
    checkFeatureLimits,
    getFeatureLimitValue,
    getIsFeatureEnabled,
  };
};
