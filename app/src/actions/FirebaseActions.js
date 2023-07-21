// import firebase from "../firebase";
// Firebase App
import firebaseApp from "firebase.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signInWithEmailLink as signInWithEmailLinkFirebaseLib,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithCredential,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  signOut as signOutFirebaseFunction,
  sendEmailVerification,
} from "firebase/auth";
import { getDatabase, ref, update, onValue, remove, get, set, child } from "firebase/database";
import md5 from "md5";
import isEmpty from "is-empty";
import { v4 as uuidv4 } from "uuid";
//UTILS
import { setEmailVerified, setSignupDate } from "../utils/AuthUtils";
import { getDesktopSignInAuthPath } from "../utils/PathUtils";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { getEmailType } from "utils/FormattingHelper";
import {
  trackSignUpAttemptedEvent,
  trackSignUpFailedEvent,
  trackSignupSuccessEvent,
} from "modules/analytics/events/common/auth/signup";
import {
  trackLoginAttemptedEvent,
  trackLoginFailedEvent,
  trackLoginSuccessEvent,
} from "modules/analytics/events/common/auth/login";
import {
  trackResetPasswordAttemptedEvent,
  trackResetPasswordFailedEvent,
  trackResetPasswordSuccessEvent,
} from "modules/analytics/events/common/auth/resetPassword";
import {
  trackForgotPasswordAttemptedEvent,
  trackForgotPasswordFailedEvent,
  trackForgotPasswordSuccessEvent,
} from "modules/analytics/events/common/auth/forgotPassword";
import {
  trackVerifyOobCodeAttempted,
  trackVerifyOobCodeFailed,
  trackVerifyOobCodeSuccess,
} from "modules/analytics/events/common/auth/verifyOobcode";
import { sanitizeDataForFirebase } from "utils/Misc";
import { createNewUsername } from "backend/auth/username";
import Logger from "lib/logger";
import { StorageService } from "init";
import APP_CONSTANTS from "config/constants";
import { DB_UTILS } from "@requestly/rq-common";
import {
  trackLogoutAttempted,
  trackLogoutFailed,
  trackLogoutSuccess,
} from "modules/analytics/events/common/auth/logout";

const { getUserProfilePath } = DB_UTILS;

const dummyUserImg = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
/**
 * SignIn with Google in popup window and create profile node
 * @returns Promise Object which can be chained with then and catch to handle success and error respectively
 */
export async function signUp(name, email, password, refCode, source) {
  const email_type = getEmailType(email);
  const domain = email.split("@")[1];
  trackSignUpAttemptedEvent({
    ref_code: refCode,
    auth_provider: AUTH_PROVIDERS.EMAIL,
    email,
    email_type,
    domain,
    source,
  });
  if (!name || isEmpty(name)) {
    trackSignUpFailedEvent({
      auth_provider: AUTH_PROVIDERS.EMAIL,
      email,
      error: "no-name",
      source,
    });
    return Promise.reject({ status: false, errorCode: "no-name" });
  }
  if (!email || isEmpty(email)) {
    trackSignUpFailedEvent({
      auth_provider: AUTH_PROVIDERS.EMAIL,
      email,
      error: "no-email",
      source,
    });
    return Promise.reject({ status: false, errorCode: "no-email" });
  }
  if (!password || isEmpty(password)) {
    trackSignUpFailedEvent({
      auth_provider: AUTH_PROVIDERS.EMAIL,
      email,
      error: "no-password",
      source,
    });
    return Promise.reject({ status: false, errorCode: "no-password" });
  }
  const auth = getAuth(firebaseApp);
  return createUserWithEmailAndPassword(auth, email, password)
    .then((result) => {
      sendEmailVerification(result.user, {
        url: window.location.href,
        handleCodeInApp: false,
      }).then(() => {
        setSignupDate(result.user.uid);
        setEmailVerified(result.user.uid, false);
      });
      return updateProfile(result.user, {
        displayName: name,
        photoURL: `https://www.gravatar.com/avatar/${md5(email)}`,
      })
        .then(() => {
          const functions = getFunctions();
          const addUserToCRM = httpsCallable(functions, "addUserToCRM");
          addUserToCRM({});
          const authData = getAuthData(result.user);
          const database = getDatabase();
          return update(ref(database, getUserProfilePath(authData.uid)), authData)
            .then(() => {
              Logger.log("Profile Created Successfully");

              createNewUsername(authData.uid)
                .then((username) => {
                  // Do Nothing
                })
                .catch((e) => Logger.error(e));

              trackSignupSuccessEvent({
                auth_provider: AUTH_PROVIDERS.EMAIL,
                email,
                ref_code: refCode,
                uid: authData.uid,
                email_type,
                domain,
                source,
              });

              return Promise.resolve({
                status: true,
                msg: "SignUp Successful",
              });
            })
            .catch((e) => {
              trackSignUpFailedEvent({
                auth_provider: AUTH_PROVIDERS.EMAIL,
                email,
                error: e?.message,
                source,
              });

              return Promise.reject({
                status: false,
                errorCode: "",
              });
            });
        })
        .catch((e) => {
          trackSignUpFailedEvent({
            auth_provider: AUTH_PROVIDERS.EMAIL,
            email,
            error: e?.message,
            source,
          });

          return Promise.reject({
            status: false,
            errorCode: "",
          });
        });
    })
    .catch((error) => {
      var errorCode = error.code;

      trackSignUpFailedEvent({
        auth_provider: AUTH_PROVIDERS.EMAIL,
        email,
        error: errorCode,
        source,
      });
      // var errorMessage = error.message;
      return Promise.reject({ status: false, errorCode });
    });
}

export async function emailSignIn(email, password, isSignUp, source) {
  trackLoginAttemptedEvent({
    auth_provider: AUTH_PROVIDERS.EMAIL,
    email,
    source,
  });
  const auth = getAuth(firebaseApp);
  return signInWithEmailAndPassword(auth, email, password)
    .then((result) => {
      Logger.log("Profile Logged In Successfully");
      // callback.call(null, true, "Profile Logged In Successfully");
      // ANALYTICS
      let uid = result?.user?.uid || null;
      let email = result?.user?.email || null;
      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.EMAIL,
        uid,
        email,
        email_type: getEmailType(email),
        domain: email.split("@")[1],
        source,
      });

      return Promise.resolve({
        status: true,
        msg: "Profile Logged In Successfully",
        result: result,
      });
    })
    .catch((error) => {
      trackLoginFailedEvent({ email: email, source });

      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      return Promise.reject({ status: false, msg: errorMessage, errorCode });
    });
}

export function forgotPassword(email) {
  trackForgotPasswordAttemptedEvent({ email });
  const auth = getAuth(firebaseApp);
  return sendPasswordResetEmail(auth, email)
    .then((result) => {
      trackForgotPasswordSuccessEvent({ email });
      Logger.log("Please check your email for instructions to reset your password.");
      return Promise.resolve({
        status: true,
        msg: "Please check your email for instructions to reset your password.",
      });
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;

      trackForgotPasswordFailedEvent({ email, error: errorCode });
      // var errorMessage = error.message;
      return Promise.reject({ status: false, errorCode });
    });
}

export function verifyOobCode(code) {
  trackVerifyOobCodeAttempted();
  if (!code) {
    trackVerifyOobCodeFailed();
    return Promise.reject({ status: false, msg: "" });
  }
  const auth = getAuth(firebaseApp);
  return verifyPasswordResetCode(auth, code)
    .then(function (email) {
      trackVerifyOobCodeSuccess();
      return Promise.resolve({ status: true, email: email });
    })
    .catch(function () {
      trackVerifyOobCodeFailed();
      Logger.log("Invalid OOB Code");
      return Promise.reject({ status: false, msg: "" });
    });
}

export function resetPassword(oobCode, password) {
  trackResetPasswordAttemptedEvent();
  if (!password) {
    return Promise.reject({ status: false, msg: "Password is Required" });
  }
  const auth = getAuth(firebaseApp);
  return confirmPasswordReset(auth, oobCode, password)
    .then((result) => {
      trackResetPasswordSuccessEvent();
      Logger.log("Password reset successful");
      return Promise.resolve({
        status: true,
        msg: "Password Reset Successful",
      });
    })
    .catch((error) => {
      trackResetPasswordFailedEvent();
      // var errorCode = error.code;
      var errorMessage = error.message;
      Logger.log("Error Resetting Password");
      return Promise.reject({ status: false, msg: errorMessage });
    });
}

export const handleOnetapSignIn = async ({ credential }) => {
  try {
    const auth = getAuth(firebaseApp);
    const OAuthCredential = GoogleAuthProvider.credential(credential);

    const result = await signInWithCredential(auth, OAuthCredential);
    const uid = result?.user?.uid || null;
    const email = result?.user?.email || null;

    const additionalUserInfo = getAdditionalUserInfo(result);
    const is_new_user = additionalUserInfo?.isNewUser || false;

    if (is_new_user) {
      trackSignUpAttemptedEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        source: "one_tap_prompt",
      });
      trackSignupSuccessEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        email,
        uid,
        email_type: getEmailType(email),
        domain: email.split("@")[1],
        source: "one_tap_prompt",
      });
    } else {
      trackLoginAttemptedEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        source: "one_tap_prompt",
      });
      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        uid,
        email,
        email_type: getEmailType(email),
        domain: email.split("@")[1],
        source: "one_tap_prompt",
      });
    }

    return { is_new_user };
  } catch (err) {
    trackLoginFailedEvent({
      auth_provider: AUTH_PROVIDERS.GMAIL,
      error_message: err.message,
      source: "one_tap_prompt",
    });
    throw err;
  }
};

export async function googleSignIn(callback, MODE, source) {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  const auth = getAuth(firebaseApp);
  return signInWithPopup(auth, provider)
    .then((result) => {
      let is_new_user = getAdditionalUserInfo(result).isNewUser || false;
      let uid = result?.user?.uid || null;
      let email = result?.user?.email || null;
      if (is_new_user) {
        trackSignUpAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          source,
        });
        trackSignupSuccessEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          email,
          uid,
          email_type: getEmailType(email),
          domain: email.split("@")[1],
          source,
        });
        setSignupDate(uid);
        setEmailVerified(uid, true);

        createNewUsername(uid)
          .then((username) => {
            // Do Nothing
          })
          .catch((e) => Logger.error(e));
      } else {
        trackLoginAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          source,
        });
        trackLoginSuccessEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          uid,
          email,
          email_type: getEmailType(email),
          domain: email.split("@")[1],
          source,
        });
      }

      const authData = getAuthData(result.user);
      const database = getDatabase();
      update(ref(database, getUserProfilePath(authData.uid)), authData);

      callback && callback.call(null, true);

      return { ...authData, isNewUser: is_new_user };
    })
    .catch((err) => {
      trackLoginFailedEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        error_message: err.message,
        source,
      });
    });
}

export const googleSignInDesktopApp = (callback, MODE, source) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const database = getDatabase();
    const oneTimeCodeRef = ref(database, `ot-auth-codes/${id}`);
    // Wait for changes
    onValue(oneTimeCodeRef, async (snapshot) => {
      const authToken = snapshot.val();
      if (!authToken) {
        return;
      }
      const auth = getAuth(firebaseApp);
      const credential = await signInWithCustomToken(auth, authToken);
      // Remove auth code from db as we no longer need it
      remove(oneTimeCodeRef);

      //Return the firebase user object
      resolve(credential.user);
    });

    window.open(getDesktopSignInAuthPath(id, source), "_blank");
  });
};

export const signInWithEmailLink = async (email, callback) => {
  trackLoginAttemptedEvent({ auth_provider: AUTH_PROVIDERS.EMAIL_LINK, email });
  try {
    const auth = getAuth(firebaseApp);
    const result = await signInWithEmailLinkFirebaseLib(auth, email, window.location.href);

    // Update details in db
    const authData = getAuthData(result.user);
    const database = getDatabase();
    // firebase.database().ref(getUserProfilePath(authData.uid)).update(authData);
    update(ref(database, getUserProfilePath(authData.uid)), authData);

    //  Analytics - Track event
    trackLoginSuccessEvent({
      auth_provider: AUTH_PROVIDERS.EMAIL_LINK,
      uid: authData.uid,
      email,
    });

    callback && callback.call(null, true);
    return authData;
  } catch (e) {
    trackLoginFailedEvent({ auth_provider: AUTH_PROVIDERS.EMAIL_LINK, email });
    return null;
  }
};

export function checkUserAuthState(callback) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  // const user = firebase.auth().currentUser;
  if (user) {
    callback.call(null, getAuthData(user));
  } else {
    callback.call(null, null);
  }
}

export async function checkUserBackupState(uid) {
  const database = getDatabase();
  const userProfileRef = ref(database, `users/${uid}/profile`);
  let backupStatus = false;

  const profile = (await get(child(userProfileRef, "/"))).toJSON();
  if (!profile) {
    return false;
  }

  if (profile.isBackupEnabled === undefined) {
    await update(userProfileRef, { isBackupEnabled: true });
    backupStatus = true;
  } else {
    backupStatus = profile.isBackupEnabled;
  }
  return backupStatus;
}

/* Syncing is not enable when storage is remote */
export async function getOrUpdateUserSyncState(uid, appMode) {
  const database = getDatabase();
  const userProfileRef = ref(database, getUserProfilePath(uid));
  let syncStatus = null;

  const profile = (await get(child(userProfileRef, "/"))).toJSON();

  if (profile) {
    if (profile.isSyncEnabled === undefined) {
      await update(userProfileRef, { isSyncEnabled: true });
      syncStatus = true;
    } else {
      syncStatus = profile.isSyncEnabled;
      // Optional - Just in case!
      if (!syncStatus) await StorageService(appMode).removeRecordsWithoutSyncing([APP_CONSTANTS.LAST_SYNC_TARGET]);
    }
  } else {
    // Profile has not been created yet - user must have signed up recently
    // Retry! - Helpful when getOrUpdateUserSyncState is first invoked from auth state listener
    setTimeout(() => {
      getOrUpdateUserSyncState(uid, appMode);
    }, 2000);
  }

  return syncStatus;
}

export function getAuthData(user) {
  const userProfile = Object.assign({}, user.providerData[0]);

  // Update uid inside providerData to user's uid
  userProfile.uid = user.uid;

  // To add a dummy photoUrl incase user profile don't have one
  if (!userProfile.photoURL) {
    userProfile.photoURL = dummyUserImg;
  }

  // Add default name in case actual name isnt provided
  if (!userProfile.displayName) {
    userProfile.displayName = "User";
  }

  return userProfile;
}

export function getNodeRef(pathArray) {
  const database = getDatabase();
  return ref(database, pathArray?.join("/"));
}

export function getValue(pathArray, callback) {
  const nodeRef = getNodeRef(pathArray);
  onValue(
    nodeRef,
    (snapshot) => callback.call(null, snapshot.val()),
    () => callback.call(null, null),
    {
      onlyOnce: true,
    }
  );
}

export function getValueAsPromise(pathArray) {
  return new Promise((resolve, reject) => getValue(pathArray, resolve));
}

export function setValue(pathArray, value) {
  const nodeRef = getNodeRef(pathArray);
  value = sanitizeDataForFirebase(value);
  return set(nodeRef, value);
}

export function updateValue(pathArray, value, callback) {
  const nodeRef = getNodeRef(pathArray);
  value = sanitizeDataForFirebase(value);
  update(nodeRef, value).then(() => callback());
}

export function updateValueAsPromise(pathArray, value) {
  return new Promise((resolve) => updateValue(pathArray, value, resolve));
}

export function removeValue(pathArray, callback) {
  const nodeRef = getNodeRef(pathArray);
  remove(nodeRef).then(() => callback());
}

export function removeValueAsPromise(pathArray) {
  return new Promise((resolve) => removeValue(pathArray, resolve));
}

export async function signOut() {
  trackLogoutAttempted();
  const auth = getAuth(firebaseApp);
  try {
    await signOutFirebaseFunction(auth);
    trackLogoutSuccess();
  } catch {
    trackLogoutFailed();
  }
}
