//CONFIG
import { MODES } from "components/misc/VerifyEmail/modes";
import APP_CONSTANTS from "../config/constants";
import { isFeatureCompatible } from "./CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { getAppFlavour } from "./AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

//CONSTANTS
const { PATHS, LINKS } = APP_CONSTANTS;

/* LAYOUTS */

export const redirectToRoot = (navigate) => {
  navigate(PATHS.ROOT);
};

/* FEATURE - RULES */

/* FEATURE - RULES - List of Rules */
export const redirectToRules = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.RULES.ABSOLUTE;
  } else {
    navigate(PATHS.RULES.ABSOLUTE);
  }
};

/* FEATURE - RULES - Create New Rule */
export const redirectToCreateNewRule = (navigate, ruleType, source, groupId = "") => {
  if (ruleType) {
    navigate(
      groupId
        ? `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${ruleType}?groupId=${groupId}`
        : `${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${ruleType}`,
      { state: { source } }
    );
  } else {
    navigate(PATHS.RULES.CREATE);
  }
};

/* FEATURE - RULES - Create a Rule */
export const redirectToCreateRuleEditor = (navigate, rule) => {
  navigate(`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule}`);
};

/* FEATURE - RULES - Edit a Rule */
/**
 * Redirects the user to the rule editor for a specific rule.
 *
 * @param {function} navigate - The navigation function from react-router.
 * @param {string} ruleId - The ID of the rule to edit.
 * @param {string} source - The source of the navigation (for analytics or state management).
 * @param {boolean} [newTab=false] - If true, opens the rule editor in a new tab.
 * @param {boolean} [replaceCurrentRouteInHistory=false] - If true, replaces the current route in history instead of adding a new one.
 */
export const redirectToRuleEditor = (
  navigate,
  ruleId,
  source,
  newTab = false,
  replaceCurrentRouteInHistory = false
) => {
  if (newTab) {
    window.open(`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${ruleId}`, "_blank");
  } else {
    navigate(`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${ruleId}`, {
      state: { source },
      replace: replaceCurrentRouteInHistory,
    });
  }
};

/* FEATURE - SHARED LIST */

export const redirectToSharedList = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.SHARED_LISTS.ABSOLUTE;
  } else {
    navigate(PATHS.SHARED_LISTS.ABSOLUTE);
  }
};

/* FEATURE - SHARED LIST - View a Shared List */
export const redirectToSharedListViewer = (navigate, shareId, sharedListName, template = false) => {
  const formattedSharedListName = sharedListName.replace(new RegExp(" +|/+", "g"), "-").replace(/-+/g, "-");

  navigate(`${PATHS.SHARED_LISTS.VIEWER.ABSOLUTE}/${shareId}-${formattedSharedListName}?template=${template}`);
};

// FEATURE - API MOCKS
export const redirectToMocks = (navigate) => {
  navigate(PATHS.MOCK_SERVER.ABSOLUTE);
};

/* FEATURE - FILES LIBRARY */
/* FEATURE - FILES LIBRARY - View a File */
export const redirectToFileViewer = (navigate, fileId, url = null) => {
  navigate({
    pathname: PATHS.MOCK_SERVER.VIEWER.ABSOLUTE + `/${fileId}`,
    state: url ? { mockUrl: url } : null,
  });
};

/* FEATURE - FILES LIBRARY - Create a New File */
/* UPDATE: FEATURE - Mock Server - Create a New Mock */
export const redirectToCreateNewFile = (navigate, config) => {
  navigate(PATHS.MOCK_SERVER.VIEWER.CREATE.ABSOLUTE + `/${config}`);
};

/* FEATURE - TEMPLATE RULES*/
export const redirectToTemplates = (navigate) => {
  navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
};

/* FEATURE - SESSION RECORDINGS */
export const redirectToSessionRecordingHome = (navigate, isDesktopSessionsEnabled = false) => {
  if (isFeatureCompatible(FEATURES.DESKTOP_SESSIONS) && isDesktopSessionsEnabled) {
    navigate(PATHS.SESSIONS.DESKTOP.WEB_SESSIONS_WRAPPER.ABSOLUTE);
    return;
  } else {
    navigate(PATHS.SESSIONS.ABSOLUTE);
    return;
  }
};

export const redirectToSavedSession = (navigate, id) => {
  navigate(PATHS.SESSIONS.SAVED.ABSOLUTE + `/${id}`);
};

export const redirectToSessionSettings = (navigate, redirectUrl, source) => {
  const appFlavour = getAppFlavour();
  if (appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR) {
    navigate(PATHS.SETTINGS.SESSIONS_SETTINGS.ABSOLUTE, { state: { redirectUrl, source } });
  } else {
    navigate(PATHS.SETTINGS.SESSION_BOOK.ABSOLUTE, { state: { redirectUrl, source } });
  }
};

export const redirectToNetworkSessionHome = (navigate, isDesktopSessionsCompatible = false) => {
  if (isDesktopSessionsCompatible) {
    navigate(PATHS.SESSIONS.DESKTOP.SAVED_LOGS.ABSOLUTE);
    return;
  } else {
    navigate(PATHS.SESSIONS.ABSOLUTE);
    return;
  }
};

export const redirectToNetworkSession = (navigate, id, isDesktopSessionsCompatible = false) => {
  if (isDesktopSessionsCompatible) {
    if (id) {
      const path = "/" + PATHS.SESSIONS.DESKTOP.NETWORK.RELATIVE + `/${id}`;
      navigate(path);
      return;
    }
    const path = "/" + PATHS.SESSIONS.DESKTOP.NETWORK.RELATIVE;
    navigate(path);
    return;
  } else {
    if (id) {
      const path = "/" + PATHS.NETWORK_LOGS.VIEWER.RELATIVE + `/${id}`;
      navigate(path);
      return;
    }
    const path = PATHS.SESSIONS.ABSOLUTE;
    navigate(path);
    return;
  }
};

/* FEATURE - API client */
export const redirectToApiClient = (navigate) => {
  navigate(`${PATHS.API_CLIENT.ABSOLUTE}`);
};

export const redirectToRequest = (navigate, requestId = "new") => {
  navigate(`${PATHS.API_CLIENT.ABSOLUTE}/request/${requestId}`);
};

export const redirectToCollection = (navigate, collectionId) => {
  navigate(`${PATHS.API_CLIENT.ABSOLUTE}/collection/${collectionId}`);
};

export const redirectToApiClientCollection = (navigate, collectionId = "new") => {
  navigate(`${PATHS.API_CLIENT.ABSOLUTE}/collection/${collectionId}`);
};

/* Settings */
export const redirectToSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToGlobalSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.GLOBAL_SETTINGS.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToDesktopSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.DESKTOP_SETTINGS.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToWorkspaceSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.WORKSPACES.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToBillingTeam = (navigate, id, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.BILLING.RELATIVE + `/${id}`, { state: { redirectUrl, source } });
};

export const redirectToBillingTeamSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.BILLING.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToMyPlan = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.MY_PLAN.ABSOLUTE, { state: { redirectUrl, source } });
};

export const redirectToProfileSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.PROFILE.ABSOLUTE, { state: { redirectUrl, source } });
};

/* Product updates */
export const redirectToProductUpdates = (navigate) => {
  navigate(PATHS.UPDATES.ABSOLUTE);
};

/* AUTH */

/* AUTH - Sign in */
export const redirectToSignIn = (navigate, options) => {
  const { redirectURL, source } = options || {};
  const baseURL = new URL(window.location.origin + PATHS.AUTH.SIGN_IN.ABSOLUTE);
  if (redirectURL) {
    baseURL.searchParams.set("redirectUrl", redirectURL);
  }
  if (source) {
    baseURL.searchParams.set("src", source);
  }
  if (navigate) {
    navigate(baseURL.pathname + baseURL.search);
  } else {
    // Hard Redirect
    window.location = baseURL.href;
  }
};

/* AUTH - Forgot Password */
export const redirectToForgotPassword = (navigate) => {
  navigate(PATHS.AUTH.FORGOT_PASSWORD.ABSOLUTE);
};

export const redirectToVerifyEmail = (navigate, options) => {
  const { redirectURL } = options || {};
  const baseURL = new URL(window.location.origin + PATHS.AUTH.VERIFY_EMAIL.ABSOLUTE);
  baseURL.searchParams.set("mode", MODES.NEW);
  if (redirectURL) {
    baseURL.searchParams.set("callbackURL", redirectURL);
  }

  if (navigate) {
    navigate(baseURL.pathname + baseURL.search);
  } else {
    // Hard Redirect
    window.location = baseURL.href;
  }
};

/* LANDING */

/* LANDING - Home */
export const redirectToLandingHomePage = (navigate) => {
  window.location.replace(LINKS.REQUESTLY_LANDING_HOME);
};

/* LANDING - Terms & Conditions */
export const redirectToTermsAndConditions = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.REQUESTLY_TERMS_AND_CONDITIONS, "_blank");
  } else {
    navigate(LINKS.REQUESTLY_TERMS_AND_CONDITIONS);
  }
};

/* LANDING - Privacy Policy */
export const redirectToPrivacyPolicy = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.REQUESTLY_PRIVACY_POLICY, "_blank");
  } else {
    navigate(LINKS.REQUESTLY_PRIVACY_POLICY);
  }
};

/* LANDING - Blog */
export const redirectToBlog = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.REQUESTLY_BLOG, "_blank");
  } else {
    navigate(LINKS.REQUESTLY_BLOG);
  }
};

/* LANDING -  Pricing */
export const redirectToPricingPlans = (navigate) => {
  if (navigate) {
    navigate(PATHS.PRICING.ABSOLUTE);
  } else {
    window.location.replace(PATHS.PRICING.ABSOLUTE);
  }
};

/* GDPR */

/* GDPR - Delete Account */
export const redirectToDeleteAccount = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.GDPR.DELETE_ACCOUNT, "_blank");
  } else {
    navigate(LINKS.GDPR.DELETE_ACCOUNT);
  }
};
/* GDPR - Sign DPA */
export const redirectToSignDPA = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.GDPR.SIGN_DPA, "_blank");
  } else {
    navigate(LINKS.GDPR.SIGN_DPA);
  }
};
/* GDPR - GDPR Page */
export const redirectToGDPRPage = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.GDPR.GDPR_PAGE, "_blank");
  } else {
    navigate(LINKS.GDPR.GDPR_PAGE);
  }
};

/* ACCOUNT */

/* ACCOUNT - View Account Details */
export const redirectToAccountDetails = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.ABSOLUTE);
  }
};

/* ACCOUNT - TEAM */
export const redirectToTeam = (navigate, teamId, options = {}) => {
  const { hardRedirect, autoRefresh, redirectBackToMyTeams, state } = options;
  const url = new URL(window.location.href);
  url.pathname = PATHS.ACCOUNT.TEAMS.ABSOLUTE + `/${teamId}`;
  if (autoRefresh) {
    url.searchParams.set("autoRefresh", "true");
  }
  if (redirectBackToMyTeams) {
    url.searchParams.set("redirectBackToMyTeams", "true");
  }
  const previousPath = window.location.pathname;
  if (hardRedirect) {
    window.location = PATHS.ACCOUNT.TEAMS.ABSOLUTE + `/${teamId}`;
  } else if (state) {
    navigate(url.pathname + url.search, { state: { ...state, previousPath } });
  } else {
    navigate(url.pathname + url.search, { state: { previousPath } });
  }
};

export const redirectToManageWorkspace = (navigate, teamId, state = {}) => {
  const previousPath = window.location.pathname;
  navigate(PATHS.ACCOUNT.TEAMS.ABSOLUTE + `/${teamId}`, { state: { ...state, previousPath } });
};

export const redirectToMyTeams = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.MY_TEAMS.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.MY_TEAMS.ABSOLUTE);
  }
};

export const redirectToCreateNewTeamWorkspace = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.CREATE_NEW_TEAM_WORKSPACE.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.CREATE_NEW_TEAM_WORKSPACE.ABSOLUTE);
  }
};

/* ACCOUNT - PERSONAL SUBSCRIPTION */
export const redirectToPersonalSubscription = (navigate, hardRedirect, autoRefresh) => {
  const url = new URL(window.location.href);
  url.pathname = PATHS.ACCOUNT.PERSONAL_SUBSCRIPTION.ABSOLUTE;
  if (autoRefresh) {
    url.searchParams.set("autoRefresh", "true");
  }
  if (hardRedirect) {
    window.location = url.href;
  } else {
    navigate(url.pathname + url.search);
  }
};

/* ACCOUNT - UPDATE SUBSCRIPTION */
export const redirectToUpdateSubscription = ({ mode, teamId, planType, isRenewal }) => {
  const url = new URL(window.location.href);
  url.pathname = PATHS.ACCOUNT.UPDATE_SUBSCRIPTION.ABSOLUTE;
  url.searchParams.set("m", mode);
  if (mode === "team") {
    url.searchParams.set("t", teamId);
  }
  url.searchParams.set("p", planType);
  if (isRenewal) url.searchParams.set("r", true);
  window.location = url.href;
};

/* MISC */
export const redirectTo404 = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.PAGE404.ABSOLUTE;
  } else {
    navigate(PATHS.PAGE404.ABSOLUTE);
  }
};

export const redirectTo403 = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.PAGE403.ABSOLUTE;
  } else {
    navigate(PATHS.PAGE403.ABSOLUTE);
  }
};

/*GITHUB ISSUES REDIRECT*/
export const redirectToGithubIssues = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.REQUESTLY_GITHUB_ISSUES, "_blank");
  } else {
    navigate(LINKS.REQUESTLY_GITHUB_ISSUES);
  }
};

/*SUPPORT EMAIL REDIRECT*/
export const redirectToSupportEmail = (navigate, { newTab }) => {
  if (newTab) {
    window.open(LINKS.CONTACT_US, "_blank");
  } else {
    navigate(LINKS.CONTACT_US);
  }
};

/* App Mode Specific Pages - Desktop - Home Page */
export const redirectToDesktopHomepage = (navigate) => {
  navigate(PATHS.DESKTOP.ABSOLUTE);
};

export const redirectToWebAppHomePage = (navigate) => {
  navigate(PATHS.HOME.ABSOLUTE);
};

export function redirectToHome(appMode, navigate) {
  if (appMode === "DESKTOP") {
    redirectToDesktopHomepage(navigate);
  } else {
    redirectToWebAppHomePage(navigate);
  }
}

// route should be choosen from APP_CONSTANTS.PATH.<your-route>.ABSOLUTE
export const redirectToDesktopApp = (route, redirectToSetappBuild = false) => {
  let redirectedRoute = redirectToSetappBuild ? "requestly-setapp://open-url" : "requestly://open-url";
  if (route) {
    redirectedRoute = `${redirectedRoute}?route=${route}`;
  }
  // for now, this assumes that desktop app has been installed
  window.location.href = redirectedRoute;
};
// Discord Community
export const redirectToDiscord = (navigate, { newTab = true }) => {
  if (newTab) {
    window.open("https://discord.gg/SumMHwuaZv", "_blank");
  }
};

export const redirectToTraffic = (navigate) => {
  navigate(PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE);
};

export const redirectToDownloadPage = () => {
  window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOWNLOAD_PAGE, "_blank");
};

/**
 * Redirects to the mock editor for editing an existing mock.
 *
 * @param {function} navigate - The navigation function from react-router.
 * @param {string} mockId - The ID of the mock to edit.
 * @param {boolean} [replaceCurrentRouteInHistory=false] - If true, replaces the current route in history instead of adding a new one.
 */
export const redirectToMockEditorEditMock = (navigate, mockId, replaceCurrentRouteInHistory = false) => {
  const mockEditUrl = `${PATHS.MOCK_SERVER_V2.EDIT.ABSOLUTE}`.replace(":mockId", mockId);
  navigate(mockEditUrl, { replace: replaceCurrentRouteInHistory });
};

/**
 * Redirects to the file mock editor for editing an existing file mock.
 *
 * @param {function} navigate - The navigation function from react-router.
 * @param {string} mockId - The ID of the file mock to edit.
 * @param {boolean} [replaceCurrentRouteInHistory=false] - If true, replaces the current route in history instead of adding a new one.
 */
export const redirectToFileMockEditorEditMock = (navigate, mockId, replaceCurrentRouteInHistory = false) => {
  const mockEditUrl = `${PATHS.FILE_SERVER_V2.EDIT.ABSOLUTE}`.replace(":mockId", mockId);
  navigate(mockEditUrl, { replace: replaceCurrentRouteInHistory });
};

export const redirectToMockEditorCreateMock = (navigate, newTab = false, collectionId = "") => {
  const URL = collectionId
    ? `${PATHS.MOCK_SERVER_V2.CREATE.ABSOLUTE}?collectionId=${collectionId}`
    : PATHS.MOCK_SERVER_V2.CREATE.ABSOLUTE;

  if (newTab) {
    window.open(URL, "_blank");
    return;
  }

  navigate(URL);
};

export const redirectToFileMockEditorCreateMock = (navigate, fileType, collectionId = "") => {
  const queryParams = new URLSearchParams();

  if (fileType) {
    queryParams.set("file_type", fileType);
  }

  if (collectionId) {
    queryParams.set("collectionId", collectionId);
  }

  navigate(`${PATHS.FILE_SERVER_V2.CREATE.ABSOLUTE}?${queryParams.toString()}`);
};

export const redirectToMocksList = (navigate, newTab = false) => {
  if (newTab) {
    return window.open(PATHS.MOCK_SERVER_V2.ABSOLUTE, "_blank");
  }
  return navigate(PATHS.MOCK_SERVER_V2.ABSOLUTE);
};

export const redirectToFileMocksList = (navigate) => {
  navigate(PATHS.FILE_SERVER_V2.ABSOLUTE);
};

export const redirectToEnvironment = (navigate, environment) => {
  navigate(`${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${environment}`);
};

export const redirectToUrl = (url, newTab = false) => {
  if (newTab) {
    return window.open(url, "_blank");
  }

  return window.open(url, "_self");
};

export const navigateBack = (navigate, location, fallback) => {
  // if the location key is not default, it means that the user has navigated to the page within the app and we can navigate back
  if (location.key !== "default") {
    navigate(-1);
  } else {
    fallback();
  }
};

export const redirectToProductSpecificPricing = (navigate, product) => {
  navigate(`${PATHS.PRICING.RELATIVE}?product=${product}`);
};

export const redirectToOAuthUrl = (navigate) => {
  redirectToUrl(LINKS.OAUTH_REDIRECT_URL);
};
