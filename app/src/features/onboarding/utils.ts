import PATHS from "config/constants/sub/paths";
import { getAppFlavour } from "utils/AppUtils";
import { isEnvAutomation } from "utils/EnvUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const shouldShowOnboarding = () => {
  const appFlavour = getAppFlavour();

  if (
    isEnvAutomation() ||
    appFlavour !== GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY ||
    window.location.href.includes(PATHS.AUTH.SIGN_IN.RELATIVE) ||
    window.location.href.includes(PATHS.AUTH.SIGN_UP.RELATIVE) ||
    window.location.href.includes(PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE) ||
    window.location.href.includes("/invite") ||
    window.location.href.includes(PATHS.AUTH.EMAIL_ACTION.RELATIVE) ||
    window.location.href.includes(PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE) ||
    window.location.href.includes(PATHS.SESSIONS.SAVED.RELATIVE) ||
    window.location.href.includes(PATHS.APPSUMO.RELATIVE) ||
    window.location.href.includes(PATHS.PRICING.RELATIVE)
  )
    return false;

  return true;
};
