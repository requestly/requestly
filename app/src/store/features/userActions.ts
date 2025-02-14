import { PayloadAction } from "@reduxjs/toolkit";
import { GlobalSliceState } from "store/slices/global/types";

export const updateUserInfo = (
  prevState: GlobalSliceState,
  action: PayloadAction<{ loggedIn: boolean; details?: any }>
) => {
  prevState.user.loggedIn = action.payload.loggedIn;
  if (action.payload.details) {
    prevState.user.details = {
      ...(prevState.user.details || {}),
      ...action.payload.details,
    };
  } else {
    prevState.user.details = null;
  }
};

export const updateUserProfile = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    userProfile: {
      isSyncEnabled?: boolean;
      isBackupEnabled?: boolean;
    };
  }>
) => {
  prevState.user.details.profile = action.payload.userProfile;

  prevState.user.details.isSyncEnabled = action.payload.userProfile?.isSyncEnabled || false;

  prevState.user.details.isBackupEnabled = action.payload.userProfile?.isBackupEnabled || false;
};

export const updateUserPlanDetails = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    userPlanDetails: any;
    isUserPremium: boolean;
  }>
) => {
  prevState.user.details.planDetails = action.payload.userPlanDetails;
  prevState.user.details.isPremium = action.payload.isUserPremium;
};

export const updateUserPreferences = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    key: string;
    value: any;
  }>
) => {
  prevState.userPreferences[action.payload.key] = action.payload.value;
};

export const updateSecondarySidebarCollapse = (
  prevState: GlobalSliceState,
  action: PayloadAction<boolean | undefined>
) => {
  const isCollapsed = prevState.userPreferences.isSecondarySidebarCollapsed;
  prevState.userPreferences.isSecondarySidebarCollapsed = action.payload ?? !isCollapsed;
};

export const updateUsername = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    username: string;
  }>
) => {
  prevState.user.details.username = action.payload.username;
};

export const updateUserDisplayName = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.user.details.profile.displayName = action.payload;
};

export const updateUserLimitReached = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.user.isLimitReached = action.payload;
};

export const updateOrganizationDetails = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  prevState.user.details.organization = action.payload;
};

//Persona Survey actions
export const setUserPersonaData = (
  prevState: GlobalSliceState,
  action: PayloadAction<Partial<GlobalSliceState["userPersona"]>>
) => {
  prevState.userPersona = { ...prevState.userPersona, ...action.payload };
};

export const updateUserPersona = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  prevState.userPersona[action.payload.key] = action.payload.value;
};

export const updateSelectedPersonaUseCase = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex((option: any) => JSON.stringify(option) === JSON.stringify(payload));

  if (index === -1) {
    prevState.userPersona.useCases = [...useCases, payload];
  } else {
    prevState.userPersona.useCases = [...useCases.slice(0, index), ...useCases.slice(index + 1)];
  }
};

export const updateOtherPersonaUseCase = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    optionType: string;
    value: string;
  }>
) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex((option: any) => option.optionType === "other");

  if (index === -1) {
    if (payload.value.length) {
      prevState.userPersona.useCases.push(payload);
    }
  } else {
    if (payload.value.length) {
      prevState.userPersona.useCases[index].value = payload.value;
    } else {
      prevState.userPersona.useCases.splice(index, 1);
    }
  }
};

export const updateIsPersonaSurveyCompleted = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.userPersona.isSurveyCompleted = action.payload;
};
export const updatePersonaSurveyPage = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.userPersona.page = action.payload;
};

export const updateUserAttributes = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  prevState.userAttributes = {
    ...prevState.userAttributes,
    ...action.payload,
  };
};

export const updateProductTourCompleted = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    tour: string;
    subTour?: string;
  }>
) => {
  if (action.payload.subTour) prevState.misc.persist[action.payload.tour][action.payload.subTour] = true;
  else prevState.misc.persist[action.payload.tour] = true;
};

export const updateNetworkSessionSaveInProgress = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.nonPersist.networkSessionSaveInProgress = action.payload;
};

export const updateNetworkSessionTooltipShown = (prevState: GlobalSliceState) => {
  prevState.misc.persist.isNetworkSessionTooltipShown = true;
};

export const updateIsWorkspaceOnboardingCompleted = (prevState: GlobalSliceState) => {
  prevState.workspaceOnboarding.isOnboardingCompleted = true;
  prevState.workspaceOnboarding.workspace = {};
};

export const updateWorkspaceOnboardingStep = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.workspaceOnboarding.step = action.payload;
};

export const updateAppOnboardingCompleted = (prevState: GlobalSliceState) => {
  prevState.appOnboarding.isOnboardingCompleted = true;
};

export const updateAppOnboardingStep = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.appOnboarding.step = action.payload;
  prevState.appOnboarding.disableSkip = false;
};

export const updateIsAppOnboardingStepDisabled = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.appOnboarding.disableSkip = action.payload;
};

export const updateAppOnboardingPersona = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.appOnboarding.persona = action.payload;
};

export const updateAppOnboardingIndustry = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.appOnboarding.industry = action.payload;
};

export const updateAppOnboardingFullName = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.appOnboarding.fullName = action.payload;
};

export const updateAppOnboardingTeamDetails = (
  prevState: GlobalSliceState,
  action: PayloadAction<Partial<GlobalSliceState["appOnboarding"]["createdWorkspace"]>>
) => {
  prevState.appOnboarding.createdWorkspace = {
    ...prevState.appOnboarding.createdWorkspace,
    ...action.payload,
  };
};

export const updateWorkspaceOnboardingTeamDetails = (
  prevState: GlobalSliceState,
  action: PayloadAction<Partial<GlobalSliceState["workspaceOnboarding"]["workspace"]>>
) => {
  prevState.workspaceOnboarding.workspace = { ...prevState.workspaceOnboarding.workspace, ...action.payload };
};

export const updateIsCommandBarOpen = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.nonPersist.isCommandBarOpen = action.payload;
};

export const updateLastSeenInviteTs = (prevState: GlobalSliceState, action: PayloadAction<number>) => {
  prevState.misc.persist.lastSeenInviteTs = action.payload;
};

export const updateJoinWorkspaceCardVisible = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isJoinWorkspaceCardVisible = action.payload;
};

export const updateIsProductHuntLaunchedBannerClosed = (
  prevState: GlobalSliceState,
  action: PayloadAction<boolean>
) => {
  prevState.misc.persist.isProductHuntLaunchedBannerClosed = action.payload;
};

export const updateExtensionInstallSource = (prevState: GlobalSliceState, action: PayloadAction<string>) => {
  prevState.misc.persist.extensionInstallSource = action.payload;
};

export const updateTimeToResendEmailLogin = (prevState: GlobalSliceState, action: PayloadAction<number>) => {
  prevState.misc.nonPersist.timeToResendEmailLogin = action.payload;
};

export const updateAppNotificationBannerDismissTs = (prevState: GlobalSliceState, action: PayloadAction<number>) => {
  prevState.misc.persist.appNotificationBannerDismissTs = action.payload;
};

export const updateIsOrgBannerDismissed = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isOrgBannerDismissed = action.payload;
};

export const updatePlanExpiredBannerClosed = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isPlanExpiredBannerClosed = action.payload;
};

export const updateIsManageBillingTeamAlertVisible = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isManageBillingTeamAlertVisible = action.payload;
};

export const updateIsAppBannerVisible = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.nonPersist.isAppBannerVisible = action.payload;
};

export const updateIsSupportChatOpened = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isSupportChatOpened = action.payload;
};

export const updateIsCodeEditorFullScreenModeOnboardingCompleted = (
  prevState: GlobalSliceState,
  action: PayloadAction<boolean>
) => {
  prevState.misc.persist.isCodeEditorFullScreenModeOnboardingCompleted = action.payload;
};

export const updateBillingTeamNudgeLastSeenTs = (prevState: GlobalSliceState, action: PayloadAction<number>) => {
  prevState.misc.persist.billingTeamNudgeLastSeenTs = action.payload;
};

export const updateIsSlackConnectButtonVisible = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.misc.persist.isSlackConnectButtonVisible = action.payload;
};
