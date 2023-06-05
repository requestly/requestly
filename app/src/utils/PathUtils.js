import APP_CONSTANTS from "../config/constants";

const { PATHS } = APP_CONSTANTS;

export const joinPaths = (path1 = "", path2 = "") => {
  return path1.concat(path2?.[0] !== "/" ? "/" + path2 : path2).replace(/\/\//g, "/");
};

export const getDesktopSignInAuthPath = (authCode, source) => {
  if (!authCode) return PATHS.AUTH.DEKSTOP_SIGN_IN.ABSOLUTE;
  return `${PATHS.AUTH.DEKSTOP_SIGN_IN.ABSOLUTE}?ot-auth-code=${authCode}&source=${source}`;
};

export const isPricingPage = (pathname = window.location.pathname) => {
  return pathname.includes(APP_CONSTANTS.PATHS.PRICING.RELATIVE);
};

export const isGoodbyePage = (pathname = window.location.pathname) => {
  return pathname.includes(APP_CONSTANTS.PATHS.GOODBYE.RELATIVE);
};

export const isInvitePage = (pathname = window.location.pathname) => {
  return pathname.startsWith("/invite");
};

export const isRulesIndexPage = (pathname = window.location.pathname) => {
  return pathname.includes(APP_CONSTANTS.PATHS.RULES.MY_RULES.RELATIVE);
};

export const isInterceptTrafficPage = (pathname = window.location.pathname) => {
  return pathname.includes(APP_CONSTANTS.PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE);
};

export const isMobileInterceptorPage = (pathname = window.location.pathname) => {
  return (
    pathname !== APP_CONSTANTS.PATHS.MOBILE_DEBUGGER.RELATIVE &&
    pathname.includes(APP_CONSTANTS.PATHS.MOBILE_DEBUGGER.RELATIVE) &&
    !pathname.includes(APP_CONSTANTS.PATHS.MOBILE_DEBUGGER.NEW.RELATIVE)
  );
};

export const getSessionRecordingSharedLink = (recordingId) => {
  return window.location.origin + APP_CONSTANTS.PATHS.SESSIONS.SAVED.ABSOLUTE + "/" + recordingId;
};

export const getSharedListURL = (shareId, sharedListName) => {
  const formattedSharedListName = sharedListName.replace(new RegExp(" +|/+", "g"), "-").replace(/-+/g, "-");
  return (
    window.location.origin +
    APP_CONSTANTS.PATHS.RULES.RELATIVE +
    "#sharedList/" +
    shareId +
    "-" +
    formattedSharedListName
  );
};
