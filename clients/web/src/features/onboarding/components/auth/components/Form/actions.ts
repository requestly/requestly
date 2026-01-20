import { isEmailValid } from "utils/FormattingHelper";
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
  appleSignIn,
} from "actions/FirebaseActions";
//CONSTANTS
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
//UTILS
import { redirectToForgotPassword } from "utils/RedirectionUtils";
import { getAuthErrorMessage, AuthTypes } from "components/authentication/utils";
import posthog from "posthog-js";
import { isLocalStoragePresent } from "utils/AppUtils";
import { clientStorageService } from "services/clientStorageService";

const showError = (err: string) => {
  toast.error(err, 3);
};
const showWarning = (err: string) => {
  toast.warn(err, 3);
};
const showInfo = (err: string) => {
  toast.info(err, 3);
};

export const handleEmailSignIn = (email: string, password: string, isSignUp: boolean, source: string) => {
  if (!email || !isEmailValid(email)) {
    showWarning("Please enter a valid email");
    return null;
  }
  if (!password) {
    showWarning("Oops! You forgot to enter password");
    return null;
  }
  return emailSignIn(email, password, isSignUp, source);
};

export const handleGoogleSignIn = (appMode: string, MODE: string, source: string) => {
  const functionToCall =
    appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? googleSignInDesktopApp : googleSignIn;

  return functionToCall(null, MODE, source);
};

export const handleAppleSignIn = (source: string) => {
  return appleSignIn(source, null);
};

export const handleEmailSignUp = (email: string, password: string, referralCode: string, source: string) => {
  return signUp(email, password, referralCode, source);
};

export const handleForgotPasswordButtonOnClick = (
  event: any,
  email: string,
  setLoader: (flag: boolean) => void,
  callbackOnSuccess: () => void
) => {
  event && event.preventDefault();
  if (!email || !isEmailValid(email)) {
    showWarning("Please enter a valid email");
    return;
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

const doResetPassword = (
  oobCode: string,
  email: string,
  newPassword: string,
  setLoader: (flag: boolean) => void,
  callbackOnSuccess: () => void
) => {
  const handleResponse = (status: unknown) => {
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

export const handleResetPasswordOnClick = (
  event: any,
  password: string,
  setLoader: (flag: boolean) => void,
  navigate: any,
  callbackOnSuccess: () => void
) => {
  event && event.preventDefault();
  if (!password) {
    showWarning("Please set a new password");
    return;
  }
  setLoader(true);

  const oobCode = getOobCode();

  const handleVerificationResponse = (status: unknown, email: string) => {
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
      ({ status, email }) => {
        handleVerificationResponse(status, email);
      },
      ({ status }) => {
        handleVerificationResponse(status, null);
      }
    )
    .catch(() => {
      handleVerificationResponse(false, null);
    });
};

export const handleLogoutButtonOnClick = async (appMode: string, isWorkspaceMode: boolean, dispatch: any) => {
  try {
    if (window.location.host.includes("app.requestly.io")) {
      try {
        posthog.reset();
      } catch (error) {
        console.log("Error while resetting posthog", error);
      }
    }
    if (!window.uid || !isLocalStoragePresent(appMode)) {
      return signOut();
    }

    if (isWorkspaceMode) {
      // clearCurrentlyActiveWorkspace(dispatch, appMode);
    } else if (window.uid && window.isSyncEnabled) {
      clientStorageService.clearStorage();
    }

    return signOut();
  } catch (err) {
    return console.log(err);
  }
};
