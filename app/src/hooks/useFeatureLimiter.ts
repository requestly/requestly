import { useSelector } from "react-redux";
import { getUserAttributes, getUserAuthDetails } from "store/selectors";
import { FeatureLimitType, featureLimits } from "./featureLimitTypes";

export const useFeatureLimiter = () => {
  const userAttributes = useSelector(getUserAttributes);
  const user = useSelector(getUserAuthDetails);

  const isUserPremium = user?.details?.isPremium;
  const isUserLoggedIn = user?.loggedIn;
  const userPlan = user?.details?.plan;

  const checkFeatureLimits = () => {
    if (!isUserLoggedIn || isUserPremium) {
      return;
    }

    const limitBreached = Object.values(FeatureLimitType).some((featureLimitType) =>
      checkIfFeatureLimitBreached(featureLimitType)
    );

    if (limitBreached) {
      //Dispatch to redux
    }
  };

  const checkIfFeatureLimitBreached = (featureLimitType: FeatureLimitType, currentValue?: number) => {
    const currentFeatureValue = currentValue || getCurrentFeatureValue(featureLimitType);
    const featureLimitValue = getFeatureLimitValue(featureLimitType);

    return currentFeatureValue > featureLimitValue;
  };

  const getCurrentFeatureValue = (featureLimitType: FeatureLimitType) => {
    switch (featureLimitType) {
      case FeatureLimitType.num_rules:
        return userAttributes?.num_rules;
      case FeatureLimitType.num_active_rules:
        return userAttributes?.num_active_rules;
    }
  };

  const getFeatureLimitValue = (featureLimitType: FeatureLimitType) => {
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
