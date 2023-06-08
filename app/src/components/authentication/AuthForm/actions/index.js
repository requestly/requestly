import isEmpty from "is-empty";
import isEmail from "validator/lib/isEmail";
import { toast } from "utils/Toast.js";
//AUTH ACTIONS
import {
  emailSignIn,
  signUp,
  forgotPassword,
  signOut,
  googleSignIn,
  verifyOobCode,
  resetPassword,
  googleSignInDesktopApp,
} from "../../../../actions/FirebaseActions";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//UTILS
import { redirectToForgotPassword } from "../../../../utils/RedirectionUtils";
import { getAuthErrorMessage, AuthTypes } from "components/authentication/utils";
import posthog from "posthog-js";
import { StorageService } from "init";
import { isLocalStoragePresent } from "utils/AppUtils";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import Logger from "lib/logger";

const showError = (err) => {
  toast.error(err, { hideProgressBar: true, autoClose: 6000 });
};
const showWarning = (err) => {
  toast.warn(err, { hideProgressBar: true });
};
const showInfo = (err) => {
  toast.info(err, { hideProgressBar: true, autoClose: 5000 });
};

export const handleEmailSignIn = (email, password, isSignUp, eventSource) => {
  if (isEmpty(email) || !isEmail(email)) {
    showWarning("Please enter a valid email");
    return null;
  }
  if (isEmpty(password)) {
    showWarning("Oops! You forgot to enter password");
    return null;
  }
  return emailSignIn(email, password, isSignUp, eventSource);
};
export const handleGoogleSignIn = (appMode, MODE, eventSource) => {
  const functionToCall =
    appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? googleSignInDesktopApp : googleSignIn;

  return functionToCall(null, MODE, eventSource);
};

export const handleEmailSignUp = (name, email, password, referralCode, eventSource) => {
  return signUp(name, email, password, referralCode, eventSource);
};

export const handleForgotPasswordButtonOnClick = (event, email, setLoader, callbackOnSuccess) => {
  event && event.preventDefault();
  if (isEmpty(email) || !isEmail(email)) {
    showWarning("Please enter a valid email");
    return null;
  }

  setLoader(true);
  forgotPassword(email)
    .then(({ status, msg }) => {
      if (status) {
        showInfo(msg);
        setLoader(false);
        callbackOnSuccess && callbackOnSuccess();
      } else {
        showError(msg);
        setLoader(false);
      }
    })
    .catch(({ errorCode }) => {
      showError(getAuthErrorMessage(AuthTypes.FORGOT_PASSWORD, errorCode));
      setLoader(false);
    });
};

//Reset Password

const getOobCode = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("oobCode")) {
    return params.get("oobCode");
  } else {
    return null;
  }
};

const doResetPassword = (oobCode, email, newPassword, setLoader, callbackOnSuccess) => {
  const handleResponse = (status) => {
    if (status) {
      setLoader(false);
      if (email) {
        callbackOnSuccess && callbackOnSuccess();
        showInfo("Password reset successful. Logging you in.");
        handleEmailSignIn(email, newPassword, null, "password_reset");
      }
    } else {
      showError("Please try again with a stronger password or request a new reset link.");
      setLoader(false);
    }
  };

  resetPassword(oobCode, newPassword)
    .then(
      ({ status, msg }) => {
        handleResponse(status);
      },
      ({ status, msg }) => {
        handleResponse(status);
      }
    )
    .catch(() => {
      handleResponse(false);
    });
};

export const handleResetPasswordOnClick = (event, password, setLoader, navigate, callbackOnSuccess) => {
  event && event.preventDefault();
  if (isEmpty(password)) {
    showWarning("Please set a new password");
    return null;
  }
  setLoader(true);

  const oobCode = getOobCode();

  const handleVerificationResponse = (status, email) => {
    if (status) {
      doResetPassword(oobCode, email, password, setLoader, callbackOnSuccess);
    } else {
      showError("This Link has been expired. Please create a new reset request.");
      setLoader(false);
      redirectToForgotPassword(navigate);
    }
  };

  verifyOobCode(oobCode)
    .then(
      ({ status, msg, email }) => {
        handleVerificationResponse(status, email);
      },
      ({ status, msg }) => {
        handleVerificationResponse(status, null);
      }
    )
    .catch(() => {
      handleVerificationResponse(false, null);
    });
};

export const handleLogoutButtonOnClick = async (appMode, isWorkspaceMode, dispatch) => {
  console.log("handleLogoutButtonOnClick invoked");
  try {
    if (window.location.host.includes("app.requestly.io")) {
      console.log("Resetting posthog");
      posthog.reset();
    }
    if (!window.uid || !isLocalStoragePresent(appMode)) {
      console.log("No user found. Signing out");
      return signOut();
    }

    if (isWorkspaceMode) {
      console.log("Clearing workspace in handleLogoutButtonOnClick");
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    } else if (window.uid && window.isSyncEnabled) {
      console.log("Clearing storage in handleLogoutButtonOnClick");
      StorageService(appMode).clearDB();
    }

    console.log("Signing out");
    return signOut();
  } catch (err) {
    return console.log(err);
  }
};
