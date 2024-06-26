import firebaseApp from "../firebase";
import { getAuth, applyActionCode, sendEmailVerification } from "firebase/auth";
import { submitAttrUtil } from "./AnalyticsUtils";
import DataStoreUtils from "./DataStoreUtils";
import { toast } from "utils/Toast.js";
import { getDateString } from "./DateTimeUtils";
import APP_CONSTANTS from "config/constants";
import {
  trackEmailVerificationSendAttempted,
  trackEmailVerificationSendFailed,
  trackEmailVerificationSendSuccess,
} from "modules/analytics/events/common/auth/emailVerification";
import Logger from "lib/logger";
import disposableEmailDomains from "disposable-email-domains/index.json";
import disposableEmailDomainsWildcard from "disposable-email-domains/wildcard.json";

const TRACKING = APP_CONSTANTS.GA_EVENTS;

/**
 * Email verified bool is taken from firebase database instead of data provided by firebase auth api
 * This is done to consider accounts before implementing email verification as email verified
 * @param {string} userId - user Id
 * @returns {Promise<boolean>} - whether account has received verification link
 */
export const isEmailVerified = (userId) => {
  if (!userId) return Promise.resolve(false);
  return DataStoreUtils.getValue(["customProfile", userId, "signup"])
    .then(async (data) => {
      // considering accounts before implementing email verification
      if (!data) {
        await setEmailVerified(userId, true);
        return true;
      } else return data.emailVerified;
    })
    .catch((err) => Logger.log(err));
};

export const isDisposableEmail = (email) => {
  const domain = email.split("@")[1];
  return disposableEmailDomains.includes(domain) || disposableEmailDomainsWildcard.includes(domain);
};

export const setEmailVerified = async (userId, value) => {
  submitAttrUtil(TRACKING.ATTR.EMAIL_VERIFIED, value);
  return DataStoreUtils.updateValueAsPromise(["customProfile", userId, "signup"], {
    emailVerified: value,
  });
};

// Intended to only be called on account creation
export const setSignupDate = (userId, date) => {
  if (!date) {
    date = new Date();
  }
  const dateStr = getDateString(date);
  submitAttrUtil(TRACKING.ATTR.SIGNUP_DATE, dateStr);
  return DataStoreUtils.setValue(["customProfile", userId, "signup"], {
    signup_date: dateStr,
  });
};

/**
 * Wrapper around firebase auth method `sendEmailVerification`
 * Also set's custom auth details - emailVerified as true in firebase
 * @returns {Promise} - Email Sent
 */
export const sendVerificationEmail = ({ url }) => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  if (user) {
    return sendEmailVerification(user, {
      url: url ? url : window.location.href,
      handleCodeInApp: false,
    });
  } else return Promise.reject({ status: false, errorCode: "Could not send Email" });
};
export const resendVerificationEmailHandler = async ({ callbackURL = APP_CONSTANTS.PROD_RULES_URL }) => {
  trackEmailVerificationSendAttempted();

  try {
    await sendVerificationEmail({
      url: callbackURL ? callbackURL : APP_CONSTANTS.PROD_RULES_URL,
      handleCodeInApp: false,
    });
    trackEmailVerificationSendSuccess();
    toast.info("Check your inbox for verification link");
  } catch (err) {
    if (err.message) {
      trackEmailVerificationSendFailed();
      if (err.message.includes("too-many-requests")) {
        toast.info("Check your inbox for verification link");
      } else {
        toast.error(err.message);
      }
    }
  }
};

export const checkVerificationCode = (code) => {
  const auth = getAuth(firebaseApp);
  return applyActionCode(auth, code);
};

// Reloading Auth is necessary after some actions like verify email, idTokenChanges(), userChanges() & authStateChanges()
export const reloadAuth = () => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  return user.reload();
};
