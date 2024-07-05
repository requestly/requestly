import { useEffect, useState } from "react";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { useIsNewUserForIncentivization } from "./useIsNewUserForIncentivization";

export const useIsIncentivizationEnabled = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const isFeatureFlagEnabled = useFeatureValue("incentivization_onboarding", false);
  const isNewUser = useIsNewUserForIncentivization("2024-06-20");

  useEffect(() => {
    const getIsIncentivizationEnabled = () => {
      return isFeatureFlagEnabled && isNewUser;
    };

    const timerId = setTimeout(() => {
      const isEnabled = getIsIncentivizationEnabled();
      setIsEnabled(isEnabled);
    }, 1 * 1000);

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isFeatureFlagEnabled, isNewUser]);

  useEffect(() => {
    window.incentivization = isEnabled;
    window.incentivizationOnboarding = isFeatureFlagEnabled;
  }, [isEnabled, isFeatureFlagEnabled]);

  return isEnabled;
};
