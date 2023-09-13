import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkUserBackupState,
  getAuthData,
  getOrUpdateUserSyncState,
  getValueAsPromise,
} from "actions/FirebaseActions";
import APP_CONSTANTS from "config/constants";
import firebaseApp from "firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { actions } from "store";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getEmailType } from "utils/FormattingHelper";
import { getAppMode } from "store/selectors";
import { getPlanName, isPremiumUser } from "utils/PremiumUtils";
import { resetUserDetails, setAndUpdateUserDetails } from "utils/helpers/appDetails/UserProvider";
import { getUsername } from "backend/auth/username";
import moment from "moment";
import { getAndUpdateInstallationDate, getSignupDate } from "utils/Misc";
import Logger from "lib/logger";

const TRACKING = APP_CONSTANTS.GA_EVENTS;
let hasAuthHandlerBeenSet = false;

const AuthHandler = (onComplete) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    if (hasAuthHandlerBeenSet) return;
    hasAuthHandlerBeenSet = true;
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authData = getAuthData(user);
        window.uid = authData?.uid;
        localStorage.setItem("__rq_uid", authData?.uid);

        submitAttrUtil(TRACKING.ATTR.EMAIL_DOMAIN, user.email.split("@")[1].replace(".", "_dot_") || "Missing_Value");
        submitAttrUtil(TRACKING.ATTR.EMAIL_TYPE, getEmailType(user.email) || "Missing_Value");

        getSignupDate(user.uid).then((signup_date) => {
          if (signup_date) {
            const signupDate = moment(signup_date);
            submitAttrUtil(TRACKING.ATTR.DAYS_SINCE_SIGNUP, moment().diff(signupDate, "days"));
          }
        });
        getAndUpdateInstallationDate(appMode, false, true).then((install_date) => {
          if (install_date) {
            const installDate = moment(install_date);
            submitAttrUtil(TRACKING.ATTR.DAYS_SINCE_INSTALL, moment().diff(installDate, "days"));
          }
        });
        try {
          // Fetch plan details
          const [planDetails, isSyncEnabled, isBackupEnabled] = await Promise.all([
            getValueAsPromise(["userSubscriptions", user.uid, "planDetails"]),
            getOrUpdateUserSyncState(user.uid, appMode),
            checkUserBackupState(user.uid),
          ]);

          const isUserPremium = isPremiumUser(planDetails);

          // Update global state
          // Set syncing state in window
          window.isSyncEnabled = isSyncEnabled;
          window.keySetDoneisSyncEnabled = true;
          // Fetch UserCountry
          dispatch(
            actions.updateUserInfo({
              loggedIn: true,
              details: {
                profile: authData,
                isLoggedIn: true,
                planDetails: {
                  ...planDetails,
                  planName: isUserPremium ? getPlanName(planDetails) : APP_CONSTANTS.PRICING.PLAN_NAMES.FREE,
                },
                isBackupEnabled,
                isSyncEnabled,
                isPremium: isUserPremium,
              },
            })
          );
          dispatch(
            actions.updateInitializations({
              initType: "auth",
              initValue: true,
            })
          );
          submitAttrUtil(TRACKING.ATTR.IS_PREMIUM, isUserPremium);

          setAndUpdateUserDetails({
            id: user?.uid,
            isLoggedIn: true,
            email: user?.email || null,
          });

          // Analytics
          if (planDetails) {
            submitAttrUtil(TRACKING.ATTR.PAYMENT_MODE, planDetails.type || "Missing Value");
            submitAttrUtil(TRACKING.ATTR.PLAN_ID, planDetails.planId || "Missing Value");

            if (planDetails.subscription) {
              submitAttrUtil(TRACKING.ATTR.PLAN_START_DATE, planDetails.subscription.startDate || "Missing Value");
              submitAttrUtil(TRACKING.ATTR.PLAN_END_DATE, planDetails.subscription.endDate || "Missing Value");
            }
          }
        } catch (e) {
          Logger.error("Unable to fetch user plan", e.message);
          // Unset UID in window object
          window.uid = null;

          dispatch(
            actions.updateUserInfo({
              loggedIn: false,
              details: null,
            })
          );
          dispatch(
            actions.updateInitializations({
              initType: "auth",
              initValue: true,
            })
          );
        }

        getUsername(authData?.uid)
          .then((username) => {
            dispatch(actions.updateUsername({ username: username }));
          })
          .catch((err) => {
            Logger.log("Error updating username in store");
          });
      } else {
        // No user is signed in, Unset UID in window object
        window.uid = null;
        // Unset isSyncEnabled in window
        window.isSyncEnabled = null;
        window.keySetDoneisSyncEnabled = true;

        resetUserDetails();

        dispatch(actions.updateUserInfo({ loggedIn: false, details: null }));
        dispatch(
          actions.updateInitializations({
            initType: "auth",
            initValue: true,
          })
        );
      }
    });
  }, [dispatch, appMode, onComplete]);

  return null;
};

export default AuthHandler;
