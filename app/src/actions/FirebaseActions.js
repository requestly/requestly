// import firebase from "../firebase";
// Firebase App
import firebaseApp from "firebase.js";
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
  sendSignInLinkToEmail,
  SAMLAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { getDatabase, ref, update, onValue, remove, get, set, child } from "firebase/database";
import md5 from "md5";
import isEmpty from "is-empty";
import { v4 as uuidv4 } from "uuid";
//UTILS
import { setEmailVerified, setSignupDate } from "../utils/AuthUtils";
import { getDesktopSignInAuthPath } from "../utils/PathUtils";
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { getEmailType } from "utils/mailCheckerUtils";
import {
  trackSignUpAttemptedEvent,
  trackSignUpFailedEvent,
  trackSignupSuccessEvent,
} from "modules/analytics/events/common/auth/signup";
import {
  trackEmailLoginLinkGenerated,
  trackLoginAttemptedEvent,
  trackLoginFailedEvent,
  trackLoginSuccessEvent,
  trackGenerateMagicLinkFailed,
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
import Logger from "lib/logger";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import {
  trackLogoutAttempted,
  trackLogoutFailed,
  trackLogoutSuccess,
} from "modules/analytics/events/common/auth/logout";
import { toast } from "utils/Toast";
import { getUserProfilePath } from "utils/db/UserModel";
import { AuthErrorCode } from "features/onboarding/screens/auth/types";
import { trackEvent } from "modules/analytics";
import { clientStorageService } from "services/clientStorageService";
import { isSetappBuild } from "utils/AppUtils";

const dummyUserImg = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
/**
 * SignIn with Google in popup window and create profile node
 * @returns Promise Object which can be chained with then and catch to handle success and error respectively
 */
export async function signUp(email, password, refCode, source) {
  const email_type = await getEmailType(email);
  const domain = email.split("@")[1];
  trackSignUpAttemptedEvent({
    ref_code: refCode,
    auth_provider: AUTH_PROVIDERS.EMAIL,
    email,
    email_type,
    domain,
    source,
  });
  // if (!name || isEmpty(name)) {
  //   trackSignUpFailedEvent({
  //     auth_provider: AUTH_PROVIDERS.EMAIL,
  //     email,
  //     error: "no-name",
  //     source,
  //   });
  //   return Promise.reject({ status: false, errorCode: "no-name" });
  // }
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
        photoURL: `https://www.gravatar.com/avatar/${md5(email)}`,
      })
        .then(() => {
          const authData = getAuthData(result.user);
          const database = getDatabase();
          return update(ref(database, getUserProfilePath(authData.uid)), authData)
            .then(() => {
              Logger.log("Profile Created Successfully");

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

export async function sendEmailLinkForSignin(
  email,
  source,
  toastMessage = "Please check your email for instructions to login."
) {
  const auth = getAuth(firebaseApp);
  return sendSignInLinkToEmail(auth, email, {
    url: window.location.href,
    handleCodeInApp: true,
  })
    .then((res) => {
      window.localStorage.setItem("RQEmailForSignIn", email);
      toast.info(toastMessage);
      trackEmailLoginLinkGenerated(email, source);
    })
    .catch((err) => {
      toast.error("Failed to send login link. Please try again, or contact support if the problem persists");
      trackGenerateMagicLinkFailed(email, source, err?.message);
      console.log(err);
    });
}

export async function emailSignIn(email, password, isSignUp, source) {
  trackLoginAttemptedEvent({
    auth_provider: AUTH_PROVIDERS.EMAIL,
    email,
    source,
  });
  const auth = getAuth(firebaseApp);
  const emailType = await getEmailType(email);
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
        email_type: emailType,
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

export const handleCustomGoogleSignIn = async (credential, successfulLoginCallback, failedLoginCallback) => {
  try {
    const auth = getAuth(firebaseApp);
    const OAuthCredential = GoogleAuthProvider.credential(credential);
    const result = await signInWithCredential(auth, OAuthCredential);

    toast.success(`Welcome back ${result.user.displayName}`);
    successfulLoginCallback();
  } catch (error) {
    toast.error("Something went wrong. Please try again.");
    failedLoginCallback(AuthErrorCode.UNKNOWN);
  }
};

export const handleOnetapSignIn = async ({ credential }) => {
  try {
    const auth = getAuth(firebaseApp);
    const OAuthCredential = GoogleAuthProvider.credential(credential);

    const result = await signInWithCredential(auth, OAuthCredential);
    const uid = result?.user?.uid || null;
    const email = result?.user?.email || null;

    const additionalUserInfo = getAdditionalUserInfo(result); // get this info
    const is_new_user = additionalUserInfo?.isNewUser || false;

    const emailType = await getEmailType(email);

    if (is_new_user) {
      trackSignUpAttemptedEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        source: SOURCE.ONE_TAP_PROMPT,
      });
      trackSignupSuccessEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        email,
        uid,
        email_type: emailType,
        domain: email.split("@")[1],
        source: SOURCE.ONE_TAP_PROMPT,
      });
    } else {
      trackLoginAttemptedEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        source: SOURCE.ONE_TAP_PROMPT,
      });
      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.GMAIL,
        uid,
        email,
        email_type: emailType,
        domain: email.split("@")[1],
        source: SOURCE.ONE_TAP_PROMPT,
      });
    }

    return { is_new_user };
  } catch (err) {
    trackLoginFailedEvent({
      auth_provider: AUTH_PROVIDERS.GMAIL,
      error_message: err.message,
      source: SOURCE.ONE_TAP_PROMPT,
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
    .then(async (result) => {
      let is_new_user = getAdditionalUserInfo(result).isNewUser || false;
      let uid = result?.user?.uid || null;
      let email = result?.user?.email || null;
      const emailType = await getEmailType(email);

      if (is_new_user) {
        trackSignUpAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          source,
        });
        trackSignupSuccessEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          email,
          uid,
          email_type: emailType,
          domain: email.split("@")[1],
          source,
        });
        setSignupDate(uid);
        setEmailVerified(uid, true);
      } else {
        trackLoginAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          source,
        });
        trackLoginSuccessEvent({
          auth_provider: AUTH_PROVIDERS.GMAIL,
          uid,
          email,
          email_type: emailType,
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

export const googleSignInDesktopApp = (callback, MODE, source, oneTimeCode) => {
  return new Promise((resolve, reject) => {
    const id = oneTimeCode || uuidv4();
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

    let desktopSignInAuthUrl = `${window.location.origin}${getDesktopSignInAuthPath(id, source)}`;

    // TODO: refactor - indicates triggered from new auth flow
    if (oneTimeCode) {
      desktopSignInAuthUrl = new URL(desktopSignInAuthUrl);
      desktopSignInAuthUrl.searchParams.append("auth_mode", MODE);
      if (isSetappBuild()) {
        desktopSignInAuthUrl.searchParams.append("isAuthForSetappBuild", "true");
      }
      desktopSignInAuthUrl = desktopSignInAuthUrl.toString();
    }

    window.open(desktopSignInAuthUrl, "_blank");
  });
};

export async function appleSignIn(source, callback) {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const auth = getAuth(firebaseApp);
  return signInWithPopup(auth, provider)
    .then(async (result) => {
      const isNewUser = getAdditionalUserInfo(result).isNewUser || false;
      const uid = result?.user?.uid || null;
      const email = result?.user?.email || null;
      const emailType = await getEmailType(email);

      if (isNewUser) {
        trackSignUpAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.APPLE,
          source,
        });
        trackSignupSuccessEvent({
          auth_provider: AUTH_PROVIDERS.APPLE,
          email,
          uid,
          email_type: emailType,
          domain: email.split("@")[1],
          source,
        });
        setSignupDate(uid);
        setEmailVerified(uid, true);
      } else {
        trackLoginAttemptedEvent({
          auth_provider: AUTH_PROVIDERS.APPLE,
          source,
        });
        trackLoginSuccessEvent({
          auth_provider: AUTH_PROVIDERS.APPLE,
          uid,
          email,
          email_type: emailType,
          domain: email.split("@")[1],
          source,
        });
      }

      const authData = getAuthData(result.user);
      const database = getDatabase();
      update(ref(database, getUserProfilePath(authData.uid)), authData);

      callback && callback.call(null, true);

      return { ...authData, isNewUser: isNewUser };
    })
    .catch((err) => {
      trackLoginFailedEvent({
        auth_provider: AUTH_PROVIDERS.APPLE,
        error_message: err.message,
        source,
      });
    });
}

export async function authorizeWithGithub(callback, source) {
  const provider = new GithubAuthProvider();
  const auth = getAuth(firebaseApp);
  return signInWithPopup(auth, provider)
    .then((result) => {
      let email = result?.user?.email || null;
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      trackEvent("github_authorized", {
        source,
        email,
      });

      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.GITHUB,
        email,
        domain: email?.split("@")?.[1],
        source,
      });

      return { accessToken: token, email };
    })
    .catch((err) => {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData.email;
        trackEvent("github_authorized", {
          source,
          email,
        });
        trackLoginSuccessEvent({
          auth_provider: AUTH_PROVIDERS.GITHUB,
          email,
          domain: email?.split("@")?.[1],
          source,
        });
        return { accessToken: err.customData?._tokenResponse?.oauthAccessToken, email };
      }

      return {};
    });
}

export const signInWithEmailLink = async (email, callback) => {
  try {
    const auth = getAuth(firebaseApp);
    const result = await signInWithEmailLinkFirebaseLib(auth, email, window.location.href);
    const additionalUserInfo = getAdditionalUserInfo(result); // get this info
    const isNewUser = additionalUserInfo?.isNewUser || false;

    Logger.log("[signInWithEmailLink]", { result, email });

    // Update details in db
    const authData = getAuthData(result.user);
    const database = getDatabase();

    if (isNewUser) await update(ref(database, getUserProfilePath(authData.uid)), authData);
    const emailType = await getEmailType(email);

    //  Analytics - Track event
    if (isNewUser) {
      setSignupDate(authData.uid);
      trackSignupSuccessEvent({
        auth_provider: AUTH_PROVIDERS.EMAIL,
        email,
        uid: authData.uid,
        email_type: emailType,
        domain: email.split("@")[1],
        source: SOURCE.MAGIC_LINK,
      });
    } else {
      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.EMAIL_LINK,
        uid: authData.uid,
        email,
        email_type: emailType,
        domain: email.split("@")[1],
        source: SOURCE.MAGIC_LINK,
      });
    }

    callback && callback.call(null, true);
    return { authData, isNewUser };
  } catch (error) {
    Logger.log("[signInWithEmailLink] catch", { error });

    if (error?.code === "auth/email-already-in-use") {
      /* user already exists with another auth provider */
      const userEmail = error?.email;
      const emailType = await getEmailType(userEmail);
      try {
        const auth = getAuth(firebaseApp);
        const authData = getAuthData(auth.currentUser) || {};
        authData.email = userEmail;
        trackLoginSuccessEvent({
          auth_provider: AUTH_PROVIDERS.EMAIL_LINK,
          uid: authData.uid,
          email,
          email_type: emailType,
          domain: email.split("@")[1],
          source: SOURCE.MAGIC_LINK,
        });

        return {
          authData,
          isNewUser: false,
        };
      } catch (e) {
        Logger.log("[signInWithEmailLink] auth/email-already-in-use catch", { e });
        /* wait for sign in to be triggered again, once userAuth is ready */
        return {
          authData: { email: userEmail },
          isNewUser: false,
        };
      }
    }
    trackLoginFailedEvent({ auth_provider: AUTH_PROVIDERS.EMAIL_LINK, email, source: SOURCE.MAGIC_LINK });
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
      if (!syncStatus) await clientStorageService.removeStorageObjects([APP_CONSTANTS.LAST_SYNC_TARGET]);
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
  userProfile.isEmailVerified = user.emailVerified;

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

/**
 * Updates user profile information in Firebase Authentication.
 * @param {Object} data - The data object containing fields to update in the Firebase user auth object.
 * Possible fields in the 'data' object like:
 * - displayName: (string) User's display name.
 * - photoURL: (string) URL of the user's profile picture.
 * Note: Ensure the user is signed in before calling this function.
 * @returns {Promise<Object>} A promise that resolves with { success: true } on successful update.
 */

export async function updateUserInFirebaseAuthUser(data) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  return new Promise((resolve) => {
    updateProfile(user, data)
      .then(() => {
        resolve({ success: true });
      })
      .catch((e) => {
        Logger.log(e);
      });
  });
}

export const loginWithSSO = async (providerId, email) => {
  const provider = new SAMLAuthProvider(providerId);

  const auth = getAuth(firebaseApp);

  return signInWithPopup(auth, provider)
    .then((result) => {
      trackLoginSuccessEvent({
        auth_provider: AUTH_PROVIDERS.SSO,
        email: result?.user?.email,
        uid: result?.user?.uid,
      });

      result.user
        .getIdToken()
        .then((tokenValue) => {
          // console.log({ tokenValue });
        })
        .catch((err) => console.log(err));
      // User is signed in.
      // Provider data available in result.additionalUserInfo.profile,
      // or from the user's ID token obtained from result.user.getIdToken()
      // as an object in the firebase.sign_in_attributes custom claim.
    })
    .catch((error) => {
      trackLoginFailedEvent({
        auth_provider: AUTH_PROVIDERS.SSO,
        email,
        place: window.location.href,
        error_message: error?.message || "SSO Login Failed",
      });
      console.log(error);
      // Handle error.
    });
};
