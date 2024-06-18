import { useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getLocalIncentivizationEventsState } from "store/features/incentivization/selectors";
import { getUserAttributes, getUserAuthDetails } from "store/selectors";

export const useIsIncentivizationEnabled = () => {
  const localIncentiveEvents = useSelector(getLocalIncentivizationEventsState);
  const userAttributes = useSelector(getUserAttributes);
  const user = useSelector(getUserAuthDetails);

  const isFeatureFlagEnabled = useFeatureValue("incentivization_onboarding", false);

  const eligibilityDate = new Date("2024-06-17");
  const currentDate = new Date();

  if (currentDate < eligibilityDate) {
    return false;
  }

  // TODO: add appmode check

  if (isFeatureFlagEnabled) {
    if (!user?.loggedIn) {
      return userAttributes.install_date && new Date(userAttributes.install_date) > eligibilityDate;
    } else {
      if (localIncentiveEvents.length > 0) return true;

      if (userAttributes.signup_date && new Date(userAttributes.signup_date) > eligibilityDate) {
        return !userAttributes.install_date || new Date(userAttributes.install_date) > eligibilityDate;
      }
    }
  }

  return false;
};
