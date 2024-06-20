import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useFeatureValue } from "@growthbook/growthbook-react";
import {
  getDaysSinceSignup,
  getExtensionInstallDate,
  getExtensionSignupDate,
  getUserAuthDetails,
} from "store/selectors";
import moment from "moment";

export const useIsIncentivizationEnabled = () => {
  const user = useSelector(getUserAuthDetails);
  const extensionInstallDate = useSelector(getExtensionInstallDate);
  const extensionSignupDate = useSelector(getExtensionSignupDate);
  const daysSinceSignup = useSelector(getDaysSinceSignup) ?? 0;

  const isFeatureFlagEnabled = useFeatureValue("incentivization_onboarding", false);

  const isEnabled = useMemo(() => {
    const releaseDate = new Date("2024-06-20").getTime();
    const currentDate = new Date().getTime();

    if (currentDate < releaseDate) {
      return false;
    }

    if (isFeatureFlagEnabled) {
      if (!user?.loggedIn) {
        return extensionInstallDate && new Date(extensionInstallDate).getTime() >= releaseDate;
      } else {
        if (extensionSignupDate) {
          if (new Date(extensionSignupDate).getTime() >= releaseDate) {
            return !extensionInstallDate || new Date(extensionInstallDate).getTime() >= releaseDate;
          }
        } else {
          // TODO: add sentry log for this case
          const momentDate = moment(currentDate);
          const signupDate = momentDate.subtract(daysSinceSignup, "days");
          return signupDate.toDate().getTime() >= releaseDate;
        }
      }
    }

    return false;
  }, [isFeatureFlagEnabled, user?.loggedIn, extensionInstallDate, extensionSignupDate, daysSinceSignup]);

  return isEnabled;
};
