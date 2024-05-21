import PATHS from "config/constants/sub/paths";

export const shouldShowOnboarding = () => {
  if (
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
