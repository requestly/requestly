import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { checkUserBackupState, getAuthData, getOrUpdateUserSyncState } from "actions/FirebaseActions";
import firebaseApp from "firebase.js";
import { User, getAuth, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { globalActions } from "store/slices/global/slice";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { getAppMode, getUserAttributes, getAppOnboardingDetails } from "store/selectors";
import { getPlanName, isPremiumUser } from "utils/PremiumUtils";
import moment from "moment";
import { getAndUpdateInstallationDate } from "utils/Misc";
import Logger from "lib/logger";
import { getUserSubscription } from "backend/user/userSubscription";
import { preparePlan } from "./DbListenerInit/userSubscriptionDocListener";
import APP_CONSTANTS from "config/constants";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getUser } from "backend/user/getUser";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { isAppOpenedInIframe } from "utils/AppUtils";
import { getEmailType } from "utils/mailCheckerUtils";
import { EmailType } from "@requestly/shared/types/common";
import { clientStorageService } from "services/clientStorageService";

const TRACKING = APP_CONSTANTS.GA_EVENTS;
let hasAuthHandlerBeenSet = false;

const AuthHandler: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const location = useLocation();
  const queryPrarams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const userAttributes = useSelector(getUserAttributes);
  const onboardingDetails = useSelector(getAppOnboardingDetails);

  const getEnterpriseAdminDetails = useMemo(() => httpsCallable(getFunctions(), "getEnterpriseAdminDetails"), []);
  const getOrganizationUsers = useMemo(
    () =>
      httpsCallable<{ domain: string }, { total: number; users: unknown[] }>(
        getFunctions(),
        "users-getOrganizationUsers"
      ),
    []
  );
  const emailTypeRef = useRef<string | null>(null);

  const nonBlockingOperations = useCallback(
    async (user: User) => {
      Logger.time("AuthHandler-nonBlockingOperations");
      Logger.timeLog("AuthHandler-nonBlockingOperations", "START");

      /* To ensure that this attribute is assigned to only the users signing up for the first time */
      if (user?.metadata?.creationTime === user?.metadata?.lastSignInTime) {
        if (
          emailTypeRef.current === EmailType.BUSINESS &&
          user.emailVerified &&
          !userAttributes[TRACKING.ATTR.COMPANY_USER_SERIAL]
        ) {
          getOrganizationUsers({ domain: getDomainFromEmail(user.email) }).then((res) => {
            const users = res.data.users;
            submitAttrUtil(TRACKING.ATTR.COMPANY_USER_SERIAL, users.length);
          });
        }
      }

      const enterpriseDetails: any = await getEnterpriseAdminDetails();

      const userData = await getUser(user.uid);

      if (userData?.signupTs) {
        const signupDate = moment(userData.signupTs);
        submitAttrUtil(TRACKING.ATTR.DAYS_SINCE_SIGNUP, moment().diff(signupDate, "days"));
      }

      submitAttrUtil(TRACKING.ATTR.BROWSERSTACK_ID, userData?.browserstackId ?? null);

      if (userData?.username) {
        dispatch(globalActions.updateUsername({ username: userData.username }));
      }

      if (userData?.metadata) {
        dispatch(globalActions.updateUserMetadata(userData.metadata));
      }

      dispatch(
        globalActions.updateUserInfo({
          loggedIn: true,
          details: {
            organization: enterpriseDetails?.data?.enterpriseData ?? null,
          },
        })
      );

      getAndUpdateInstallationDate(appMode, false, true).then((install_date) => {
        if (install_date) {
          const installDate = moment(install_date);
          submitAttrUtil(TRACKING.ATTR.DAYS_SINCE_INSTALL, moment().diff(installDate, "days"));
        }
      });

      Logger.timeEnd("AuthHandler-nonBlockingOperations");
    },
    [appMode, dispatch, getEnterpriseAdminDetails, getOrganizationUsers, userAttributes]
  );

  const blockingOperations = useCallback(
    async (user: User): Promise<boolean> => {
      Logger.time("AuthHandler-blockingOperations");
      Logger.timeLog("AuthHandler-blockingOperations", "START");
      const authData = getAuthData(user);
      window.uid = user.uid;
      localStorage.setItem("__rq_uid", user.uid);

      try {
        // FIXME: getOrUpdateUserSyncState, checkUserBackupState taking too long for large workspace, can this be improved or moved to non-blocking operations?
        const [firestorePlanDetails, isSyncEnabled, isBackupEnabled, mailType] = await Promise.all([
          getUserSubscription(user.uid),
          getOrUpdateUserSyncState(user.uid, appMode),
          checkUserBackupState(user.uid),
          getEmailType(user.email),
        ]);

        emailTypeRef.current = mailType;

        const planDetails = preparePlan(firestorePlanDetails);
        const isUserPremium = isPremiumUser(planDetails);

        window.isSyncEnabled = isSyncEnabled;
        window.keySetDoneisSyncEnabled = true;

        dispatch(
          globalActions.updateUserInfo({
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
              emailType: mailType,
            },
          })
        );
        dispatch(
          globalActions.updateInitializations({
            initType: "auth",
            initValue: true,
          })
        );

        submitAttrUtil(TRACKING.ATTR.EMAIL_DOMAIN, user.email.split("@")[1].replace(".", "_dot_") ?? "Missing_Value");
        submitAttrUtil(TRACKING.ATTR.EMAIL_TYPE, mailType ?? "Missing_Value");

        submitAttrUtil(TRACKING.ATTR.IS_PREMIUM, isUserPremium);
        const userName = user.displayName !== "User" ? user.displayName : onboardingDetails.fullName;
        submitAttrUtil(TRACKING.ATTR.DISPLAY_NAME, userName);

        if (planDetails) {
          submitAttrUtil(TRACKING.ATTR.PAYMENT_MODE, planDetails.type ?? "Missing Value");
          submitAttrUtil(TRACKING.ATTR.PLAN_ID, planDetails.planId ?? "Missing Value");
          submitAttrUtil(TRACKING.ATTR.IS_TRIAL, planDetails.status === "trialing");
          submitAttrUtil(TRACKING.ATTR.SUBSCRIPTION_STATUS, planDetails.status);
          submitAttrUtil(
            TRACKING.ATTR.RQ_SUBSCRIPTION_TYPE,
            firestorePlanDetails?.rqSubscriptionType ?? planDetails.type
          );

          if (planDetails.subscription) {
            submitAttrUtil(TRACKING.ATTR.PLAN_START_DATE, planDetails.subscription.startDate ?? "Missing Value");
            submitAttrUtil(TRACKING.ATTR.PLAN_END_DATE, planDetails.subscription.endDate ?? "Missing Value");
          }
        }

        Logger.timeEnd("AuthHandler-blockingOperations");
        return true;
      } catch (e) {
        Logger.error("Unable to fetch user plan", e.message);
        // Unset UID in window object
        window.uid = null;

        dispatch(
          globalActions.updateUserInfo({
            loggedIn: false,
            details: null,
          })
        );
        dispatch(
          globalActions.updateInitializations({
            initType: "auth",
            initValue: true,
          })
        );

        return false;
      }
    },
    [appMode, dispatch, onboardingDetails.fullName]
  );

  useEffect(() => {
    if (queryPrarams.get("refreshToken") && isAppOpenedInIframe()) {
      const refreshToken = queryPrarams.get("refreshToken");
      const getCustomToken = httpsCallable(getFunctions(), "auth-generateCustomToken");
      getCustomToken({ refreshToken }).then(
        (res: {
          data: {
            success: boolean;
            result: {
              customToken: string;
              message: string;
            };
          };
        }) => {
          if (res.data.success) {
            const auth = getAuth(firebaseApp);
            signInWithCustomToken(auth, res.data.result.customToken)
              .then((user) => {
                // Signed in
                Logger.log("User signed in with custom token", user);
              })
              .catch((error) => {
                Logger.log("Error signing in with custom token:", error.message);
              });
          } else {
            Logger.log("Error generating custom token:", res.data.result.message);
          }
        }
      );
    }
  }, [queryPrarams]);

  useEffect(() => {
    if (hasAuthHandlerBeenSet) return;
    hasAuthHandlerBeenSet = true;

    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      Logger.time("AuthHandler");
      Logger.time("AuthHandler-preloader");

      if (user) {
        Logger.timeLog("AuthHandler-preloader", "User found");
        clientStorageService.saveStorageObject({
          [GLOBAL_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN]: user.refreshToken,
        });

        blockingOperations(user).then((success: boolean) => {
          if (success) {
            nonBlockingOperations(user).then(() => {
              Logger.timeEnd("AuthHandler");
            });
          }
        });
      } else {
        // No user is signed in, Unset UID in window object
        window.uid = null;
        // Unset isSyncEnabled in window
        window.isSyncEnabled = null;
        window.keySetDoneisSyncEnabled = true;
        localStorage.removeItem("__rq_uid");
        clientStorageService.removeStorageObject(GLOBAL_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
        // set amplitude anon id to local storage:
        const planDetails = preparePlan();
        dispatch(
          globalActions.updateUserInfo({
            loggedIn: false,
            details: planDetails ? { planDetails, isPremium: isPremiumUser(planDetails) } : null,
          })
        );
        dispatch(
          globalActions.updateInitializations({
            initType: "auth",
            initValue: true,
          })
        );
      }
    });
  }, [
    dispatch,
    appMode,
    getEnterpriseAdminDetails,
    getOrganizationUsers,
    userAttributes,
    blockingOperations,
    nonBlockingOperations,
  ]);

  return null;
};

export default AuthHandler;
