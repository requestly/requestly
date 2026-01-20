import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import STORAGE from "config/constants/sub/storage";

export enum AuthTypes {
  FORGOT_PASSWORD = "forgot-password",
  RESET_PASSWORD = "reset-password",
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
}

const getForgotPasswordErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Unable to find an account with this email address. Please try again.";

    case "auth/invalid-email":
      return "This email seems invalid. Please recheck.";

    default:
      return (
        "Unable to request new password this time. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL
      );
  }
};
const getSignInErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email";

    case "auth/user-not-found":
      return "This email is not registered. Please sign up.";

    case "auth/wrong-password":
      return "Invalid email or password. Please try again or use Forgot Password.";

    case "auth/user-disabled":
      return "Sorry but your account is disabled. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL;

    default:
      return "Sorry, we couldn't log you in. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL;
  }
};

const getSignUpErrorMessage = (errorCode: string) => {
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
      return "Sorry but your account is disabled. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL;
    default:
      console.error("Unknown error code", errorCode);
      return "Sorry, we couldn't sign you up. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL;
  }
};

export const getAuthErrorMessage = (authType: string, errorCode: string) => {
  switch (authType) {
    case AuthTypes.SIGN_IN:
      return getSignInErrorMessage(errorCode);

    case AuthTypes.SIGN_UP:
      return getSignUpErrorMessage(errorCode);

    case AuthTypes.FORGOT_PASSWORD:
      return getForgotPasswordErrorMessage(errorCode);

    default:
      return "An unexpected has occurred. Please write us to " + GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL;
  }
};

export const getDesktopAppAuthParams = (): URLSearchParams | null => {
  try {
    const EXPIRY_DURATION = 3 * 60 * 1000; // 3mins -> milliseconds
    const value = window.localStorage.getItem(STORAGE.LOCAL_STORAGE.RQ_DESKTOP_APP_AUTH_PARAMS);
    if (!value) {
      return null;
    }

    const paramsObj = JSON.parse(value) as { params: string; createdAt: number };

    if (Date.now() - paramsObj.createdAt > EXPIRY_DURATION) {
      return null;
    }

    return new URLSearchParams(paramsObj.params);
  } catch (error) {
    return null;
  }
};
