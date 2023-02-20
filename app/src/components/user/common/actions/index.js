// STORE
import { actions } from "../../../../store";
// Firebase
import firebaseApp from "../../../../firebase";
import { getAuth } from "firebase/auth";
import {
  getAuthData,
  getValueAsPromise,
} from "../../../../actions/FirebaseActions";
import { getPlanName, isPremiumUser } from "../../../../utils/PremiumUtils";
import APP_CONSTANTS from "../../../../config/constants";
import {
  resetUserDetails,
  setAndUpdateUserDetails,
} from "utils/helpers/appDetails/UserProvider";

// This function is similar to useLayout of App.js.
// Only difference is that this is invoked once only on-demand
export const refreshUserInGlobalState = async (dispatch) => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (user) {
    // User is signed in
    let newUserDetailsObject = {};
    // Fetch plan details
    getValueAsPromise(["userSubscriptions", user.uid, "planDetails"])
      .then((planDetails) => {
        const authData = getAuthData(user);
        // Set UID in window object
        window.uid = authData?.uid;
        localStorage.setItem("__rq_uid", authData?.uid);

        newUserDetailsObject = {
          uid: authData?.uid,
          profile: authData,
          isLoggedIn: true,
          planDetails: {
            ...planDetails,
            planName: isPremiumUser(planDetails)
              ? getPlanName(planDetails)
              : APP_CONSTANTS.PRICING.PLAN_NAMES.BRONZE,
          },
          isPremium: isPremiumUser(planDetails),
        };
      })
      .then(async () => {
        // Fetch rule backups details
        const isBackupEnabled = await getValueAsPromise([
          "users",
          user.uid,
          "profile",
          "isBackupEnabled",
        ]);
        if (isBackupEnabled) {
          newUserDetailsObject["isBackupEnabled"] = true;
        } else {
          newUserDetailsObject["isBackupEnabled"] = false;
        }
        // Update global state
        dispatch(
          actions.updateUserInfo({
            loggedIn: true,
            details: newUserDetailsObject,
          })
        );

        setAndUpdateUserDetails({
          id: newUserDetailsObject.uid,
          isLoggedIn: true,
          planDetails: newUserDetailsObject.planDetails,
          email: newUserDetailsObject.profile.email,
        });
      })
      .catch((e) => {
        // Unset UID in window object
        window.uid = null;
        dispatch(actions.updateUserInfo({ loggedIn: false, details: null }));

        resetUserDetails();
      });
  } else {
    // Unset UID in window object
    window.uid = null;

    dispatch(actions.updateUserInfo({ loggedIn: false, details: null }));

    resetUserDetails();
  }
};
