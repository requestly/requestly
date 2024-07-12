import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getDaysSinceSignup,
  getExtensionInstallDate,
  getExtensionSignupDate,
  getUserAuthDetails,
} from "store/selectors";

/**
 * @param {string} date - release date
 */
export const useIsNewUserForIncentivization = (date: string) => {
  const user = useSelector(getUserAuthDetails);
  const extensionInstallDate = useSelector(getExtensionInstallDate);
  const extensionSignupDate = useSelector(getExtensionSignupDate);
  const daysSinceSignup = useSelector(getDaysSinceSignup) ?? 0;
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const checkIfNewUser = () => {
      const releaseDate = new Date(date).getTime();
      const currentDate = new Date().getTime();

      if (currentDate < releaseDate) {
        return false;
      }

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
    };

    const isNewUser = checkIfNewUser();
    setIsNewUser(isNewUser);
  }, [date, user?.loggedIn, extensionInstallDate, extensionSignupDate, daysSinceSignup]);

  return isNewUser;
};
