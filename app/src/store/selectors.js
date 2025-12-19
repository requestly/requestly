import { ReducerKeys } from "./constants";

export const getGlobalState = (rootState) => {
  return rootState[ReducerKeys.GLOBAL];
};

export const getIsExtensionEnabled = (state) => {
  return getGlobalState(state)["isExtensionEnabled"];
};

export const getBottomSheetOrientation = (state) => {
  return getGlobalState(state)["bottomSheetOrientation"] || {};
};

export const getBottomSheetState = (state, context) => {
  const orientation = getBottomSheetOrientation(state);
  return orientation[context] || null;
};

export const getRulesNode = (state) => {
  return getGlobalState(state)["rules"];
};

export const getAllRulesData = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["allRules"];
};

export const getAllRules = (state) => {
  const allRulesData = getAllRulesData(state);
  return allRulesData["rules"];
};

export const getAllGroups = (state) => {
  const allRulesData = getAllRulesData(state);
  return allRulesData["groups"];
};

export const getRulesToPopulate = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["rulesToPopulate"];
};

export const getGroupwiseRulesToPopulate = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["groupwiseRulesToPopulate"];
};

export const getIsRulesListLoading = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["isRulesListLoading"];
};

export const getRulesSelection = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["selectedRules"];
};

export const getGroupsSelection = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["selectedGroups"];
};

export const getIsSampleRulesImported = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["isSampleRulesImported"];
};

export const getCurrentlySelectedRule = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["currentlySelectedRule"];
};

export const getCurrentlySelectedRuleData = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["data"];
};

export const getCurrentlySelectedRuleConfig = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["config"];
};

export const getIsCurrentlySelectedRuleHasUnsavedChanges = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["hasUnsavedChanges"];
};

export const getIsWorkspaceSwitchConfirmationActive = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["isWorkspaceSwitchConfirmationActive"];
};

export const getCurrentlySelectedRuleErrors = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["errors"];
};

export const getIsCurrentlySelectedRuleDetailsPanelShown = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["showDetailsPanel"];
};

// response rule resource type
export const getResponseRuleResourceType = (state) => {
  const rule = getCurrentlySelectedRuleData(state);
  return rule?.pairs?.[0]?.response?.resourceType ?? "";
};

export const getRequestRuleResourceType = (state) => {
  const rule = getCurrentlySelectedRuleData(state);
  return rule?.pairs?.[0]?.request?.resourceType ?? "";
};

export const getLastBackupTimeStamp = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["lastBackupTimeStamp"];
};

export const getSearch = (state) => {
  return getGlobalState(state)["search"];
};

export const getRulesSearchKeyword = (state) => {
  const allSearch = getSearch(state);
  return allSearch["rules"];
};

export const getFilesSearchKeyword = (state) => {
  const allSearch = getSearch(state);
  return allSearch["files"];
};

export const getSharedListsSearchKeyword = (state) => {
  const allSearch = getSearch(state);
  return allSearch["sharedLists"];
};

export const getPendingHardRefreshItems = (state) => {
  return getGlobalState(state)["pendingHardRefresh"];
};

export const getIsHardRefreshRulesPending = (state) => {
  const pendingHardRefreshItems = getPendingHardRefreshItems(state);
  return pendingHardRefreshItems["rules"];
};

export const getPendingRefreshItems = (state) => {
  return getGlobalState(state)["pendingRefresh"];
};

export const getIsRefreshRulesPending = (state) => {
  const pendingRefreshItems = getPendingRefreshItems(state);
  return pendingRefreshItems["rules"];
};

export const getIsRefreshSharesListsPending = (state) => {
  const pendingRefreshItems = getPendingRefreshItems(state);
  return pendingRefreshItems["sharedLists"];
};

export const getIsRefreshSessionRecordingConfigPending = (state) => {
  const pendingRefreshItems = getPendingRefreshItems(state);
  return pendingRefreshItems["sessionRecordingConfig"];
};

/** sharedLists  */
export const getSharedListsNode = (state) => {
  return getGlobalState(state)["sharedLists"];
};

export const getSelectedSharedLists = (state) => {
  const sharedListsNode = getSharedListsNode(state);
  return sharedListsNode["selectedLists"];
};

export const getHasConnectedApp = (state) => {
  return getGlobalState(state).misc?.persist?.hasConnectedApp;
};

export const getAppMode = (state) => {
  return getGlobalState(state)["appMode"];
};

export const getAppTheme = (state) => {
  return getGlobalState(state)["appTheme"];
};

export const getDesktopSpecificDetails = (state) => {
  return getGlobalState(state)["desktopSpecificDetails"];
};

export const getDesktopSpecificAppDetails = (state, appId) => {
  return getDesktopSpecificDetails(state)?.["appsList"]?.[appId];
};

export const getUserCountry = (state) => {
  return getGlobalState(state)["country"];
};

export const getAppLanguage = (state) => {
  return getGlobalState(state)["appLanguage"];
};

export const getAuthInitialization = (state) => {
  return getGlobalState(state)["initializations"]["auth"];
};

// userPreferences
export const getUserPreferences = (state) => {
  return getGlobalState(state)["userPreferences"];
};

export const getUserPersonaSurveyDetails = (state) => {
  return getGlobalState(state)["userPersona"];
};

export const getUserAttributes = (state) => {
  return getGlobalState(state)["userAttributes"];
};

// Had to make a separate selector, since consuming
// "userAttributes" directly in <RulesListContainer/> component goes into infinite re-renders
// TODO: fix above
export const getUserRulesCount = (state) => {
  return getUserAttributes(state)?.num_rules ?? 0;
};

export const getExtensionInstallDate = (state) => {
  return getUserAttributes(state).install_date;
};

export const getExtensionSignupDate = (state) => {
  return getUserAttributes(state).signup_date;
};

export const getDaysSinceSignup = (state) => {
  return getUserAttributes(state).days_since_signup;
};

export const getIsProductHuntLaunchedBannerClosed = (state) => {
  return getGlobalState(state).misc?.persist?.isProductHuntLaunchedBannerClosed;
};

export const getIsRedirectRuleTourCompleted = (state) => {
  return getGlobalState(state).misc?.persist?.isRedirectRuleTourCompleted;
};
export const getIsTrafficTableTourCompleted = (state) => {
  return getGlobalState(state).misc.persist?.isTrafficTableTourCompleted;
};

export const getIsRuleEditorTourCompleted = (state) => {
  return (
    getGlobalState(state).misc.persist?.isRuleEditorTourCompleted ||
    getGlobalState(state).misc.persist?.isRedirectRuleTourCompleted
  );
};

export const getIsCodeEditorFullScreenModeOnboardingCompleted = (state) => {
  return getGlobalState(state).misc.persist?.isCodeEditorFullScreenModeOnboardingCompleted;
};

export const getIsMiscTourCompleted = (state) => {
  return getGlobalState(state).misc.persist?.isMiscTourCompleted;
};

export const getIsConnectedAppsTourCompleted = (state) => {
  return getGlobalState(state).misc.persist?.isConnectedAppsTourCompleted;
};

export const getNetworkSessionSaveInProgress = (state) => {
  return getGlobalState(state).misc.nonPersist?.networkSessionSaveInProgress;
};

export const getIsNetworkTooltipShown = (state) => {
  return getGlobalState(state).misc.persist?.isNetworkSessionTooltipShown;
};

export const getIsWorkspaceOnboardingCompleted = (state) => {
  return getGlobalState(state)?.workspaceOnboarding?.isOnboardingCompleted;
};

export const getWorkspaceOnboardingStep = (state) => {
  return getGlobalState(state)?.workspaceOnboarding?.step;
};

export const getAppOnboardingDetails = (state) => {
  return getGlobalState(state)?.appOnboarding;
};

export const getIsSecondarySidebarCollapsed = (state) => {
  return getGlobalState(state).userPreferences.isSecondarySidebarCollapsed;
};

export const getWorkspaceOnboardingTeamDetails = (state) => {
  return getGlobalState(state)?.workspaceOnboarding?.workspace;
};

export const getIsCommandBarOpen = (state) => {
  return getGlobalState(state).misc.nonPersist?.isCommandBarOpen;
};

export const getLastSeenInviteTs = (state) => {
  return getGlobalState(state).misc.persist?.lastSeenInviteTs;
};

export const getIsJoinWorkspaceCardVisible = (state) => {
  return getGlobalState(state).misc.persist?.isJoinWorkspaceCardVisible;
};

export const getExtensionInsallSource = (state) => {
  return getGlobalState(state).misc.persist?.extensionInstallSource;
};

export const getTimeToResendEmailLogin = (state) => {
  return getGlobalState(state).misc.nonPersist?.timeToResendEmailLogin;
};

export const getAppNotificationBannerDismissTs = (state) => {
  return getGlobalState(state).misc.persist?.appNotificationBannerDismissTs;
};

export const getIsOrgBannerDismissed = (state) => {
  return getGlobalState(state).misc.persist?.isOrgBannerDismissed;
};

export const getIsPlanExpiredBannerClosed = (state) => {
  return getGlobalState(state).misc.persist?.isPlanExpiredBannerClosed;
};

export const getIsManageBillingTeamAlertVisible = (state) => {
  return getGlobalState(state).misc.persist?.isManageBillingTeamAlertVisible;
};

export const getAllEditorToast = (state) => {
  return getGlobalState(state).editorToast;
};

export const getToastForEditor = (state, id) => {
  return getGlobalState(state).editorToast[id];
};

export const getIsAppBannerVisible = (state) => {
  return getGlobalState(state).misc.nonPersist?.isAppBannerVisible;
};

export const getIsSupportChatOpened = (state) => {
  return getGlobalState(state).misc.persist?.isSupportChatOpened;
};

// request bot
export const getRequestBot = (state) => {
  return getGlobalState(state).misc.nonPersist?.requestBot;
};

export const getBillingTeamNudgeLastSeenTs = (state) => {
  return getGlobalState(state).misc.persist?.billingTeamNudgeLastSeenTs;
};

export const getIsSlackConnectButtonVisible = (state) => {
  return getGlobalState(state).misc.persist?.isSlackConnectButtonVisible;
};

export const getLastUsedFeaturePath = (state) => {
  return getGlobalState(state)?.misc?.persist?.lastUsedFeaturePath || "/";
};

export const getIsNewUser = (state) => {
  return getGlobalState(state).onboarding.isNewUser;
};

export const getIsOnboardingCompleted = (state) => {
  return getGlobalState(state).onboarding.isOnboardingCompleted;
};

export const getIsAcquisitionAnnouncementModalVisible = (state) => {
  return getGlobalState(state).onboarding.isAcquisitionAnnouncementModalVisible;
};

export const getPopupConfig = (state) => {
  return getGlobalState(state).popupConfig;
};

export const getHasGeneratedAITests = (state) => {
  return getGlobalState(state).misc.persist?.hasGeneratedAITests;
};
