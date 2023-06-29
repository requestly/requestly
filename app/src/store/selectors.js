import { ReducerKeys } from "./constants";

export const getGlobalState = (rootState) => {
  return rootState[ReducerKeys.GLOBAL];
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

export const getMarketplaceRules = (state) => {
  const allRules = getAllRules(state);
  return allRules.filter((data) => "MKTRuleID" in data);
};

export const getUniqueMarketplaceRuleID = (state) => {
  const onlyMarketplaceRules = getMarketplaceRules(state);
  const uniqueMarketplaceRuleIDs = onlyMarketplaceRules.filter(
    (rule, index, self) => self.findIndex((x) => x.MKTRuleID === rule.MKTRuleID) === index
  );
  return uniqueMarketplaceRuleIDs;
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

export const getCurrentlySelectedRuleErrors = (state) => {
  const currentlySelectedRule = getCurrentlySelectedRule(state);
  return currentlySelectedRule["errors"];
};

// response rule resource type
export const getResponseRuleResourceType = (state) => {
  const rule = getCurrentlySelectedRuleData(state);
  return rule?.pairs?.[0]?.response?.resourceType ?? "";
};

export const getLastBackupTimeStamp = (state) => {
  const rulesNode = getRulesNode(state);
  return rulesNode["lastBackupTimeStamp"];
};

export const getUserAuthDetails = (state) => {
  return getGlobalState(state)["user"];
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

export const getMarketplaceSearchKeyword = (state) => {
  const allSearch = getSearch(state);
  return allSearch["marketplace"];
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

export const getActiveModals = (state) => {
  return getGlobalState(state)["activeModals"];
};

export const getHasConnectedApp = (state) => {
  return getGlobalState(state).misc?.persist?.hasConnectedApp;
};

export const getMarketplaceRuleStatus = (state) => {
  return getGlobalState(state)["marketplace"]["ruleStatus"];
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

export const getUserCountry = (state) => {
  return getGlobalState(state)["country"];
};

export const getIfTrialModeEnabled = (state) => {
  return getGlobalState(state)["trialModeEnabled"];
};

export const getMobileDebuggerAppDetails = (state) => {
  const mobileDebuggerDetails = getGlobalState(state)["mobileDebugger"] || {};
  return mobileDebuggerDetails["app"];
};

export const getMobileDebuggerInterceptorDetails = (state) => {
  const mobileDebuggerDetails = getGlobalState(state)["mobileDebugger"] || {};
  return mobileDebuggerDetails["interceptor"];
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

export const getIsSecondarySidebarCollapsed = (state) => {
  return getGlobalState(state).userPreferences.isSecondarySidebarCollapsed;
};

export const getWorkspaceOnboardingTeamDetails = (state) => {
  return getGlobalState(state)?.workspaceOnboarding?.workspace;
};
