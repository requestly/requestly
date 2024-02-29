import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkUserBackupState, getAuthData, getOrUpdateUserSyncState } from "actions/FirebaseActions";
import firebaseApp from "firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { actions } from "store";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getDomainFromEmail, getEmailType, isCompanyEmail } from "utils/FormattingHelper";
import { getAppMode, getUserAttributes } from "store/selectors";
import { getPlanName, isPremiumUser } from "utils/PremiumUtils";
import { resetUserDetails, setAndUpdateUserDetails } from "utils/helpers/appDetails/UserProvider";
import { getUsername } from "backend/auth/username";
import moment from "moment";
import { getAndUpdateInstallationDate, getSignupDate } from "utils/Misc";
import Logger from "lib/logger";
import { getUserSubscription } from "backend/user/userSubscription";
import { newSchemaToOldSchemaAdapter } from "./DbListenerInit/userSubscriptionDocListener";
import APP_CONSTANTS from "config/constants";
import { getFunctions, httpsCallable } from "firebase/functions";
import formbricks from "@formbricks/js";

const TRACKING = APP_CONSTANTS.GA_EVENTS;
let hasAuthHandlerBeenSet = false;

const AuthHandler = (onComplete) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const userAttributes = useSelector(getUserAttributes);

  const getEnterpriseAdminDetails = useMemo(() => httpsCallable(getFunctions(), "getEnterpriseAdminDetails"), []);
  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    if (hasAuthHandlerBeenSet) return;
    hasAuthHandlerBeenSet = true;
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authData = getAuthData(user);
        window.uid = authData?.uid;
        localStorage.setItem("__rq_uid", authData?.uid);

        // New user signing in from an org domain will be assigned a serial number attribute
        if (user?.metadata?.creationTime === user?.metadata?.lastSignInTime) {
          if (isCompanyEmail(user.email) && user.emailVerified && !userAttributes[TRACKING.ATTR.COMPANY_USER_SERIAL]) {
            getOrganizationUsers({ domain: getDomainFromEmail(user.email) }).then((res) => {
              const users = res.data.users;
              submitAttrUtil(TRACKING.ATTR.COMPANY_USER_SERIAL, users.length);
            });
          }
        }

        submitAttrUtil(TRACKING.ATTR.EMAIL_DOMAIN, user.email.split("@")[1].replace(".", "_dot_") ?? "Missing_Value");
        submitAttrUtil(TRACKING.ATTR.EMAIL_TYPE, getEmailType(user.email) ?? "Missing_Value");

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
          const [firestorePlanDetails, isSyncEnabled, isBackupEnabled, enterpriseDetails] = await Promise.all([
            getUserSubscription(user.uid),
            getOrUpdateUserSyncState(user.uid, appMode),
            checkUserBackupState(user.uid),
            getEnterpriseAdminDetails(),
          ]);

          // phase-1 migration: Adaptor to convert firestore schema into old schema
          const planDetails = newSchemaToOldSchemaAdapter(firestorePlanDetails);
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
                  planName: getPlanName(planDetails),
                },
                isBackupEnabled,
                isSyncEnabled,
                isPremium: isUserPremium,
                organization: enterpriseDetails?.data?.enterpriseData ?? null,
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
            email: user?.email ?? null,
          });

          // Analytics
          if (planDetails) {
            submitAttrUtil(TRACKING.ATTR.PAYMENT_MODE, planDetails.type ?? "Missing Value");
            submitAttrUtil(TRACKING.ATTR.PLAN_ID, planDetails.planId ?? "Missing Value");
            submitAttrUtil(TRACKING.ATTR.IS_TRIAL, planDetails.status === "trialing");

            if (planDetails.subscription) {
              submitAttrUtil(TRACKING.ATTR.PLAN_START_DATE, planDetails.subscription.startDate ?? "Missing Value");
              submitAttrUtil(TRACKING.ATTR.PLAN_END_DATE, planDetails.subscription.endDate ?? "Missing Value");
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
            Logger.log("Error updating username in store :", err.message);
          });
      } else {
        // No user is signed in, Unset UID in window object
        window.uid = null;
        // Unset isSyncEnabled in window
        window.isSyncEnabled = null;
        window.keySetDoneisSyncEnabled = true;
        if (window.FORMBRICKS_INTEGRATION_DONE) {
          formbricks.logout();
        }
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
  }, [dispatch, appMode, onComplete, getEnterpriseAdminDetails, getOrganizationUsers, userAttributes]);

  return null;
};

export default AuthHandler;
