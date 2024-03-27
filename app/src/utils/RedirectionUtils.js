//CONFIG
import { MODES } from "components/misc/VerifyEmail/modes";
import APP_CONSTANTS from "../config/constants";
import { isFeatureCompatible } from "./CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

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
export const redirectToCreateNewRule = (navigate, ruleType, source) => {
  if (ruleType) {
    navigate(`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${ruleType}`, {
      state: { source },
    });
  } else {
    navigate(PATHS.RULES.CREATE);
  }
};

/* FEATURE - RULES - Create a Rule */
export const redirectToCreateRuleEditor = (navigate, rule) => {
  navigate(`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${rule}`);
};

/* FEATURE - RULES - Edit a Rule */
export const redirectToRuleEditor = (navigate, ruleId, source) => {
  navigate(`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${ruleId}`, {
    state: { source },
  });
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

/* FEATURE - FILES LIBRARY - List of All Files */
export const redirectToFiles = (navigate) => {
  navigate(PATHS.FILES.MY_FILES.ABSOLUTE);
};

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
  navigate(PATHS.SETTINGS.SESSION_BOOK.ABSOLUTE, { state: { redirectUrl, source } });
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
      const path = PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE + `/${id}`;
      navigate(path);
      return;
    }
    const path = PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE;
    navigate(path);
    return;
  } else {
    if (id) {
      const path = PATHS.NETWORK_LOGS.VIEWER.RELATIVE + `/${id}`;
      navigate(path);
      return;
    }
    const path = PATHS.SESSIONS.ABSOLUTE;
    navigate(path);
    return;
  }
};

/* Settings */
export const redirectToSettings = (navigate, redirectUrl, source) => {
  navigate(PATHS.SETTINGS.GLOBAL_SETTINGS.ABSOLUTE, { state: { redirectUrl, source } });
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
  navigate(PATHS.SETTINGS.BILLING.RELATIVE, { state: { redirectUrl, source } });
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
  if (hardRedirect) {
    window.location = PATHS.ACCOUNT.TEAMS.ABSOLUTE + `/${teamId}`;
  } else if (state) {
    navigate(url.pathname + url.search, { state });
  } else {
    navigate(url.pathname + url.search);
  }
};

export const redirectToManageWorkspace = (navigate, teamId) => {
  navigate(PATHS.ACCOUNT.TEAMS.ABSOLUTE + `/${teamId}`);
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

// route should be choosen from APP_CONSTANTS.PATH.<your-route>.ABSOLUTE
export const redirectToDesktopApp = (route) => {
  let redirectedRoute = "requestly://open-url";
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

export const redirectToCreateNewApp = (navigate) => {
  navigate(PATHS.MOBILE_DEBUGGER.NEW.ABSOLUTE);
};

export const redirectToMobileDebuggerHome = (navigate, appId) => {
  navigate(`${PATHS.MOBILE_DEBUGGER.ABSOLUTE}/${appId}`);
};

export const redirectToMobileDebuggerInterceptor = (navigate, appId) => {
  navigate(`${PATHS.MOBILE_DEBUGGER.ABSOLUTE}/${appId}/interceptor`);
};

export const redirectToMobileDebuggerUnauthorized = (navigate, appId) => {
  navigate(`${PATHS.MOBILE_DEBUGGER.ABSOLUTE}/${appId}/unauthorized`);
};

export const redirectToDownloadPage = () => {
  window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOWNLOAD_PAGE, "_blank");
};

export const redirectToMockEditorEditMock = (navigate, mockId) => {
  const mockEditUrl = `${PATHS.MOCK_SERVER_V2.EDIT.ABSOLUTE}`.replace(":mockId", mockId);
  navigate(mockEditUrl);
};

export const redirectToFileMockEditorEditMock = (navigate, mockId) => {
  const mockEditUrl = `${PATHS.FILE_SERVER_V2.EDIT.ABSOLUTE}`.replace(":mockId", mockId);
  navigate(mockEditUrl);
};

export const redirectToMockEditorCreateMock = (navigate, newTab = false) => {
  if (newTab) {
    window.open(PATHS.MOCK_SERVER_V2.CREATE.ABSOLUTE, "_blank");
    return;
  }
  navigate(PATHS.MOCK_SERVER_V2.CREATE.ABSOLUTE);
};

export const redirectToFileMockEditorCreateMock = (navigate, fileType) => {
  const queryParam = fileType ? "file_type=" + fileType : "";
  navigate(`${PATHS.FILE_SERVER_V2.CREATE.ABSOLUTE}?${queryParam}`);
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

export const redirectToUrl = (url, newTab = false) => {
  if (newTab) {
    return window.open(url, "_blank");
  }

  return window.open(url);
};
