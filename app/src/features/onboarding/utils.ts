import * as Sentry from "@sentry/react";
import PATHS from "config/constants/sub/paths";
import STORAGE from "config/constants/sub/storage";
import { isEnvAutomation } from "utils/EnvUtils";

const EXCLUDED_PATHS = [
  PATHS.AUTH.SIGN_IN.RELATIVE,
  PATHS.AUTH.SIGN_UP.RELATIVE,
  PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
  "/invite",
  PATHS.AUTH.EMAIL_ACTION.RELATIVE,
  PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
  PATHS.SESSIONS.SAVED.RELATIVE,
  PATHS.APPSUMO.RELATIVE,
  PATHS.PRICING.RELATIVE,
  PATHS.AUTH.START.RELATIVE,
  PATHS.AUTH.LOGIN.RELATIVE,
  PATHS._INSTALLED_EXTENSION.RELATIVE,
];

export const shouldShowOnboarding = () => {
  if (isEnvAutomation()) return false;

  const currentPath = window.location.href;
  return !EXCLUDED_PATHS.some((path) => currentPath.includes(path));
};

type RedirectMetadata = {
  source: string;
  redirectURL: string;
};

export const setRedirectMetadata = ({ source, redirectURL }: RedirectMetadata): void => {
  const metadata: RedirectMetadata = {
    source,
    redirectURL,
  };

  try {
    window.localStorage.setItem(STORAGE.LOCAL_STORAGE.AUTH_REDIRECT_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    Sentry.captureException(error, {
      extra: { metadata },
    });
  }
};

export const getRedirectMetadata = () => {
  let metadata = null;

  try {
    metadata = window.localStorage.getItem(STORAGE.LOCAL_STORAGE.AUTH_REDIRECT_METADATA_KEY);
    return JSON.parse(metadata) as RedirectMetadata;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { metadata },
    });
  }
};

export const clearRedirectMetadata = () => {
  window.localStorage.removeItem(STORAGE.LOCAL_STORAGE.AUTH_REDIRECT_METADATA_KEY);
};
