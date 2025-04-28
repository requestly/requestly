import PATHS from "config/constants/sub/paths";
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
];

export const shouldShowOnboarding = () => {
  if (isEnvAutomation()) return false;

  const currentPath = window.location.href;
  return !EXCLUDED_PATHS.some((path) => currentPath.includes(path));
};
