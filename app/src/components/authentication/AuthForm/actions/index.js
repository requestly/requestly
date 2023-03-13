import isEmpty from "is-empty";
import isEmail from "validator/lib/isEmail";
import { toast } from "utils/Toast.js";
import { Modal } from "antd";
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
import { getGreeting } from "../../../../utils/FormattingHelper";
import posthog from "posthog-js";
import { StorageService } from "init";
import { isLocalStoragePresent } from "utils/AppUtils";
import { clearCurrentlyActiveWorkspace } from "actions/TeamWorkspaceActions";
import Logger from "lib/logger";

const authTypes = {
  FORGOT_PASSWORD: "forgot-password",
  RESET_PASSWORD: "reset-password",
  SIGN_IN: "sign-in",
  SIGN_UP: "sign-up",
};

const showError = (err) => {
  toast.error(err, { hideProgressBar: true, autoClose: 6000 });
};
const showWarning = (err) => {
  toast.warn(err, { hideProgressBar: true });
};
const showInfo = (err) => {
  toast.info(err, { hideProgressBar: true, autoClose: 5000 });
};

const showVerifyEmailMessage = () => {
  Modal.info({
    title: "Verify email",
    content: (
      <div>
        <p>
          Please click on the link that has just been sent to your email account
          to verify your email.
        </p>
      </div>
    ),
  });
};

const getForgotPasswordErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Unable to find an account with this email address. Please try again.";

    case "auth/invalid-email":
      return "This email seems invalid. Please recheck.";

    default:
      return (
        "Unable to request new password this time. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
  }
};

const getSignInErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email";

    case "auth/user-not-found":
      return "This email is not registered. Please sign up.";

    case "auth/wrong-password":
      return "Invalid email or password. Please try again or use Forgot Password.";

    case "auth/user-disabled":
      return (
        "Sorry but your account is disabled. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );

    default:
      return (
        "Sorry, we couldn’t log you in. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
  }
};

const getSignUpErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "no-name":
      return "Please enter your name.";
    case "no-email":
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "no-password":
      return "Please enter a password to create.";
    case "auth/email-already-in-use":
      return "The email you entered is already in use. Try signing in.";
    case "auth/weak-password":
      return "Please choose a stronger password";
    case "auth/operation-not-allowed":
      return (
        "Sorry but your account is disabled. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
    default:
      return (
        "Sorry, we couldn’t sign you up. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
  }
};

const getPrettyErrorMessage = (authType, errorCode) => {
  switch (authType) {
    case authTypes.SIGN_IN:
      return getSignInErrorMessage(errorCode);

    case authTypes.SIGN_UP:
      return getSignUpErrorMessage(errorCode);

    case authTypes.FORGOT_PASSWORD:
      return getForgotPasswordErrorMessage(errorCode);

    default:
      return (
        "An unexpected has occurred. Please write us at " +
        GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
  }
};

export const handleEmailSignInButtonOnClick = (
  event,
  email,
  password,
  isSignUp,
  appMode,
  setLoader,
  src,
  callbackOnSuccess,
  callbackOnFail,
  eventSource
) => {
  event && event.preventDefault();
  if (isEmpty(email) || !isEmail(email)) {
    showWarning("Please enter a valid email");
    return null;
  }
  if (isEmpty(password)) {
    showWarning("Oops! You forgot to enter password");
    return null;
  }
  setLoader && setLoader(true);
  emailSignIn(email, password, isSignUp, eventSource)
    .then(({ result }) => {
      if (result.user.uid) {
        showInfo(`${getGreeting()}, ${result.user.displayName.split(" ")[0]}`);
        callbackOnSuccess && callbackOnSuccess(result.user.uid);
      } else {
        showError("Sorry we couldn't log you in. Can you please retry?");
        setLoader && setLoader(false);
        //Clear password field
        callbackOnFail && callbackOnFail();
      }
    })
    .catch(({ errorCode }) => {
      showError(getPrettyErrorMessage(authTypes.SIGN_IN, errorCode));
      setLoader && setLoader(false);
      callbackOnFail && callbackOnFail();
    });
};
export const handleGoogleSignInButtonOnClick = (
  setLoader,
  src,
  callbackOnSuccess,
  appMode,
  MODE,
  navigate,
  eventSource
) => {
  setLoader && setLoader(true);
  const functionToCall =
    appMode && appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP
      ? googleSignInDesktopApp
      : googleSignIn;

  functionToCall(null, MODE, eventSource)
    .then((result) => {
      if (result && result.uid) {
        showInfo(`${getGreeting()}, ${result.displayName.split(" ")[0]}`);
        callbackOnSuccess && callbackOnSuccess();
      }
      setLoader && setLoader(false);
    })
    .catch(() => {
      setLoader && setLoader(false);
    });
};

export const handleSignUpButtonOnClick = (
  event,
  name,
  email,
  password,
  referralCode,
  setLoader,
  navigate,
  emailOptin,
  isSignUp,
  callbackOnSuccess,
  eventSource
) => {
  event.preventDefault();
  setLoader(true);
  signUp(name, email, password, referralCode, eventSource)
    .then(({ status, errorCode }) => {
      if (status) {
        // showInfo(`Hey ${name}!, welcome aboard!`);
        showVerifyEmailMessage();
        handleEmailSignInButtonOnClick(
          null,
          email,
          password,
          isSignUp,
          null,
          null,
          null,
          callbackOnSuccess,
          () => {},
          eventSource
        );
      } else {
        showError(getPrettyErrorMessage(authTypes.SIGN_UP, errorCode));
        setLoader(false);
      }
    })
    .catch(({ errorCode }) => {
      showError(getPrettyErrorMessage(authTypes.SIGN_UP, errorCode));
      setLoader(false);
    });
};

export const handleForgotPasswordButtonOnClick = (
  event,
  email,
  setLoader,
  callbackOnSuccess
) => {
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
      showError(getPrettyErrorMessage(authTypes.FORGOT_PASSWORD, errorCode));
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
  oobCode,
  email,
  newPassword,
  setLoader,
  callbackOnSuccess
) => {
  const handleResponse = (status) => {
    if (status) {
      setLoader(false);
      if (email) {
        callbackOnSuccess && callbackOnSuccess();
        showInfo("Password reset successful. Logging you in.");
        handleEmailSignInButtonOnClick(
          null,
          email,
          newPassword,
          null,
          null,
          null,
          null,
          null,
          null,
          "password_reset"
        );
      }
    } else {
      showError(
        "Please try again with a stronger password or request a new reset link."
      );
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
  event,
  password,
  setLoader,
  navigate,
  callbackOnSuccess
) => {
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
      showError(
        "This Link has been expired. Please create a new reset request."
      );
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

export const handleLogoutButtonOnClick = async (
  appMode,
  isWorkspaceMode,
  dispatch
) => {
  try {
    if (window.location.host.includes("app.requestly.io")) {
      posthog.reset();
    }
    if (!window.uid || !isLocalStoragePresent(appMode)) {
      return signOut();
    }

    if (isWorkspaceMode) {
      clearCurrentlyActiveWorkspace(dispatch, appMode);
    } else if (window.uid && window.isSyncEnabled) {
      Logger.log("Clearing storage in handleLogoutButtonOnClick");
      StorageService(appMode).clearDB();
    }

    return signOut();
  } catch (err) {
    return Logger.log(err);
  }
};
