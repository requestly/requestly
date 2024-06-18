import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getLocalIncentivizationEventsState } from "store/features/incentivization/selectors";
import { getExtensionInstallDate, getExtensionSignupDate, getUserAuthDetails } from "store/selectors";

export const useIsIncentivizationEnabled = () => {
  const user = useSelector(getUserAuthDetails);
  const extensionInstallDate = useSelector(getExtensionInstallDate);
  const extensionSignupDate = useSelector(getExtensionSignupDate);
  const localIncentiveEvents = useSelector(getLocalIncentivizationEventsState);

  const isFeatureFlagEnabled = useFeatureValue("incentivization_onboarding", false);

  const isEnabled = useMemo(() => {
    const eligibilityDate = new Date("2024-06-17");
    const currentDate = new Date();

    if (currentDate < eligibilityDate) {
      return false;
    }

    if (isFeatureFlagEnabled) {
      if (!user?.loggedIn) {
        return extensionInstallDate && new Date(extensionInstallDate) > eligibilityDate;
      } else {
        if (localIncentiveEvents.length > 0) {
          return true;
        }

        if (extensionSignupDate && new Date(extensionSignupDate) > eligibilityDate) {
          return !extensionInstallDate || new Date(extensionInstallDate) > eligibilityDate;
        }
      }
    }

    return false;
  }, [isFeatureFlagEnabled, user?.loggedIn, extensionInstallDate, localIncentiveEvents?.length, extensionSignupDate]);

  return isEnabled;
};
