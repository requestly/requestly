//CONFIG
import { MODES } from "components/misc/VerifyEmail";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../config/constants";

//CONSTANTS
const { PATHS, LINKS } = APP_CONSTANTS;
const { APP_MODES } = GLOBAL_CONSTANTS;

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
export const redirectToSharedListViewer = (
  navigate,
  shareId,
  sharedListName,
  template = false
) => {
  const formattedSharedListName = sharedListName
    .replace(new RegExp(" +|/+", "g"), "-")
    .replace(/-+/g, "-");

  navigate(
    `${PATHS.SHARED_LISTS.VIEWER.ABSOLUTE}/${shareId}-${formattedSharedListName}?template=${template}`
  );
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
export const redirectToSessionRecordingHome = (navigate) => {
  navigate(PATHS.SESSIONS.ABSOLUTE);
};

/* Settings */
export const redirectToSettings = (navigate) => {
  navigate(PATHS.SETTINGS.ABSOLUTE);
};

export const redirectToDesktopPreferences = (navigate) => {
  navigate(PATHS.SETTINGS.DESKTOP_PREFERENCES.ABSOLUTE);
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
  const baseURL = new URL(
    window.location.origin + PATHS.AUTH.VERIFY_EMAIL.ABSOLUTE
  );
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

/* USER */

/* USER - Unlock Premium */
export const redirectToUnlockPremium = (navigate) => {
  navigate(PATHS.UNLOCK_PREMIUM.ABSOLUTE);
};

/* USER - License - Index Page */
export const redirectToLicenseIndexPage = (navigate) => {
  navigate(PATHS.LICENSE.ABSOLUTE);
};

/* USER - License - Manage */
export const redirectToManageLicense = (navigate) => {
  navigate(PATHS.LICENSE.MANAGE.ABSOLUTE);
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

/* ACCOUNT - My Organization*/
export const redirectToMyOrganization = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.MY_ORGANIZATION.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.MY_ORGANIZATION.ABSOLUTE);
  }
};
/* ACCOUNT - Create new Org */
export const redirectToCreateOrg = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.CREATE_ORGANIZATION.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.CREATE_ORGANIZATION.ABSOLUTE);
  }
};

/* ACCOUNT - View Backups */
export const redirectToBackups = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.MY_BACKUPS.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.MY_BACKUPS.ABSOLUTE);
  }
};

/* ACCOUNT - TEAM */
export const redirectToTeam = (
  navigate,
  teamId,
  hardRedirect,
  autoRefresh,
  redirectBackToMyTeams
) => {
  const url = new URL(window.location.href);
  url.pathname = PATHS.ACCOUNT.TEAM.ABSOLUTE + `/${teamId}`;
  if (autoRefresh) {
    url.searchParams.set("autoRefresh", "true");
  }
  if (redirectBackToMyTeams) {
    url.searchParams.set("redirectBackToMyTeams", "true");
  }
  if (hardRedirect) {
    window.location = PATHS.ACCOUNT.TEAM.ABSOLUTE + `/${teamId}`;
  } else {
    navigate(url.pathname + url.search);
  }
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
export const redirectToPersonalSubscription = (
  navigate,
  hardRedirect,
  autoRefresh
) => {
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

/* ACCOUNT - CHECKOUT */
export const redirectToCheckout = ({
  mode,
  teamId,
  planType: planName,
  days,
  quantity,
}) => {
  const url = new URL(window.location.href);
  url.pathname = PATHS.CHECKOUT.ABSOLUTE;
  url.searchParams.set("m", mode);
  if (teamId) {
    url.searchParams.set("t", teamId);
  }
  url.searchParams.set("p", planName);
  url.searchParams.set("d", days);
  if (quantity) {
    url.searchParams.set("q", quantity);
  }
  if (window?.RQ?.MODE === APP_MODES.DESKTOP) {
    window.open(url.href, "_blank");
  } else {
    window.location = url.href;
  }
};

/* MARKETPLACE REDIRECT */
export const redirectToMarketplace = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.MARKETPLACE.ABSOLUTE;
  } else {
    navigate(PATHS.MARKETPLACE.ABSOLUTE);
  }
};

/* ACCOUNT - UPDATE SUBSCRIPTION */
export const redirectToUpdateSubscription = ({
  mode,
  teamId,
  planType,
  isRenewal,
}) => {
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

/* ACCOUNT - UPDATE SUBSCRIPTION Contact Us */
export const redirectToUpdateSubscriptionContactUs = () => {
  const url = new URL(window.location.href);
  url.pathname = PATHS.ACCOUNT.UPDATE_SUBSCRIPTION_CONTACT_US.ABSOLUTE;
  window.location = url.href;
};

/* ACCOUNT - UPDATE PAYMENT METHOD */
export const redirectToUpdatePaymentMethod = () => {
  redirectToUpdateSubscriptionContactUs();
};

/* ACCOUNT - PAYMENT FAILED */
export const redirectToPaymentFailed = (errorCode) => {
  let qp = "?ref=stripe&paymentId=5357551a-e2d7";
  if (errorCode && typeof errorCode === "string")
    qp = qp.concat("err=" + errorCode);
  window.location.href = PATHS.PAYMENT_FAIL.ABSOLUTE + qp;
};

/* ACCOUNT - REFRESH SUBSCRIPTION */
export const redirectToRefreshSubscription = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ACCOUNT.REFRESH_SUBSCRIPTION.ABSOLUTE;
  } else {
    navigate(PATHS.ACCOUNT.REFRESH_SUBSCRIPTION.ABSOLUTE);
  }
};

/* ONBOARDING PAGE */
export const redirectToOnboardingPage = (navigate, hardRedirect) => {
  if (hardRedirect) {
    window.location.href = PATHS.ONBOARDING.ABSOLUTE;
  } else {
    navigate(PATHS.ONBOARDING.ABSOLUTE);
  }
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

/* Change App Mode */
export const redirectToAppMode = (navigate) => {
  navigate(PATHS.APP_MODE.ABSOLUTE);
};

/* App Mode Specific Pages - Desktop - Home Page */
export const redirectToDesktopHomepage = (navigate) => {
  navigate(PATHS.DESKTOP.ABSOLUTE);
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

export const redirectToApps = (navigate) => {
  navigate(PATHS.DESKTOP.MY_APPS.ABSOLUTE);
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
  const mockEditUrl = `${PATHS.MOCK_SERVER_V2.EDIT.ABSOLUTE}`.replace(
    ":mockId",
    mockId
  );
  navigate(mockEditUrl);
};

export const redirectToFileMockEditorEditMock = (navigate, mockId) => {
  const mockEditUrl = `${PATHS.FILE_SERVER_V2.EDIT.ABSOLUTE}`.replace(
    ":mockId",
    mockId
  );
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
