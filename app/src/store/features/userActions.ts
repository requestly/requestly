import { SurveyPage } from "components/misc/PersonaSurvey/types";
import { SUB_TOUR_TYPES, TOUR_TYPES } from "components/misc/ProductWalkthrough/types";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { GlobalSliceState } from "store/slices/global/types";
import { UserAuth } from "store/slices/global/user/types";

export const updateUserInfo = (
  prevState: GlobalSliceState,
  action: {
    payload: { loggedIn: boolean; details: UserAuth["details"] };
  }
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
  action: { payload: { userProfile: UserAuth["details"]["profile"] } }
) => {
  prevState.user.details.profile = action.payload.userProfile;

  prevState.user.details.isSyncEnabled = action.payload.userProfile?.isSyncEnabled || false;

  prevState.user.details.isBackupEnabled = action.payload.userProfile?.isBackupEnabled || false;
};

export const updateUserPlanDetails = (
  prevState: GlobalSliceState,
  action: { payload: { userPlanDetails: UserAuth["details"]["planDetails"]; isUserPremium: boolean } }
) => {
  prevState.user.details.planDetails = action.payload.userPlanDetails;
  prevState.user.details.isPremium = action.payload.isUserPremium;
};

export const updateUserPreferences = (
  prevState: GlobalSliceState,
  action: { payload: { key: keyof GlobalSliceState["userPreferences"]; value: boolean } }
) => {
  prevState.userPreferences[action.payload.key] = action.payload.value;
};

export const updateSecondarySidebarCollapse = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  const isCollapsed = prevState.userPreferences.isSecondarySidebarCollapsed;
  prevState.userPreferences.isSecondarySidebarCollapsed = action.payload ?? !isCollapsed;
};

export const updateUsername = (prevState: GlobalSliceState, action: { payload: { username: string } }) => {
  prevState.user.details.username = action.payload.username;
};

export const updateUserDisplayName = (prevState: GlobalSliceState, action: { payload: string }) => {
  prevState.user.details.profile.displayName = action.payload;
};

export const updateUserLimitReached = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.user.isLimitReached = action.payload;
};

export const updateOrganizationDetails = (prevState: GlobalSliceState, action: { payload: string }) => {
  prevState.user.details.organization = action.payload;
};

//Persona Survey actions
export const setUserPersonaData = (
  prevState: GlobalSliceState,
  action: { payload: GlobalSliceState["userPersona"] }
) => {
  prevState.userPersona = { ...prevState.userPersona, ...action.payload };
};

export const updateUserPersona = (prevState: GlobalSliceState, action: { payload: { key: string; value: string } }) => {
  (prevState.userPersona as any)[action.payload.key] = action.payload.value;
};

export const updateSelectedPersonaUseCase = (prevState: GlobalSliceState, action: { payload: any }) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex((option: string) => JSON.stringify(option) === JSON.stringify(payload));

  if (index === -1) {
    prevState.userPersona.useCases = [...useCases, payload];
  } else {
    prevState.userPersona.useCases = [...useCases.slice(0, index), ...useCases.slice(index + 1)];
  }
};

export const updateOtherPersonaUseCase = (prevState: GlobalSliceState, action: { payload: any }) => {
  const { useCases } = prevState.userPersona;
  const { payload } = action;

  const index = useCases.findIndex((option: { optionType: string }) => option.optionType === "other");

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

export const updateIsPersonaSurveyCompleted = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.userPersona.isSurveyCompleted = action.payload;
};

export const updatePersonaSurveyPage = (prevState: GlobalSliceState, action: { payload: SurveyPage }) => {
  prevState.userPersona.page = action.payload;
};

export const updateUserAttributes = (
  prevState: GlobalSliceState,
  action: { payload: GlobalSliceState["userAttributes"] }
) => {
  prevState.userAttributes = {
    ...prevState.userAttributes,
    ...action.payload,
  };
};

export const updateProductTourCompleted = (
  prevState: GlobalSliceState,
  action: {
    payload: {
      subTour?: SUB_TOUR_TYPES;
      tour: TOUR_TYPES;
    };
  }
) => {
  if (typeof prevState.misc.persist[action.payload.tour] === "object") {
    if (action.payload.subTour) {
      const tour = prevState.misc.persist[action.payload.tour] as Record<string, boolean>;
      tour[action.payload.subTour] = true;
    }
  } else {
    prevState.misc.persist[action.payload.tour] = true;
  }
};

export const updateNetworkSessionSaveInProgress = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.nonPersist.networkSessionSaveInProgress = action.payload;
};

export const updateNetworkSessionTooltipShown = (prevState: GlobalSliceState) => {
  prevState.misc.persist.isNetworkSessionTooltipShown = true;
};

export const updateIsWorkspaceOnboardingCompleted = (prevState: GlobalSliceState) => {
  prevState.workspaceOnboarding.isOnboardingCompleted = true;
  prevState.workspaceOnboarding.workspace = {};
};

export const updateWorkspaceOnboardingStep = (prevState: GlobalSliceState, action: { payload: ONBOARDING_STEPS }) => {
  prevState.workspaceOnboarding.step = action.payload;
};

export const updateAppOnboardingCompleted = (prevState: GlobalSliceState) => {
  prevState.appOnboarding.isOnboardingCompleted = true;
};

export const updateAppOnboardingStep = (prevState: GlobalSliceState, action: { payload: ONBOARDING_STEPS }) => {
  prevState.appOnboarding.step = action.payload;
  prevState.appOnboarding.disableSkip = false;
};

export const updateIsAppOnboardingStepDisabled = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.appOnboarding.disableSkip = action.payload;
};

export const updateAppOnboardingPersona = (
  prevState: GlobalSliceState,
  action: { payload: GlobalSliceState["appOnboarding"]["persona"] }
) => {
  prevState.appOnboarding.persona = action.payload;
};

export const updateAppOnboardingIndustry = (prevState: GlobalSliceState, action: { payload: string }) => {
  prevState.appOnboarding.industry = action.payload;
};

export const updateAppOnboardingFullName = (prevState: GlobalSliceState, action: { payload: string }) => {
  prevState.appOnboarding.fullName = action.payload;
};

export const updateAppOnboardingTeamDetails = (
  prevState: GlobalSliceState,
  action: { payload: GlobalSliceState["appOnboarding"]["createdWorkspace"] }
) => {
  prevState.appOnboarding.createdWorkspace = {
    ...prevState.appOnboarding.createdWorkspace,
    ...action.payload,
  };
};

export const updateWorkspaceOnboardingTeamDetails = (
  prevState: GlobalSliceState,
  action: { payload: GlobalSliceState["workspaceOnboarding"]["workspace"] }
) => {
  prevState.workspaceOnboarding.workspace = { ...prevState.workspaceOnboarding.workspace, ...action.payload };
};

export const updateIsCommandBarOpen = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.nonPersist.isCommandBarOpen = action.payload;
};

export const updateLastSeenInviteTs = (prevState: GlobalSliceState, action: { payload: number }) => {
  prevState.misc.persist.lastSeenInviteTs = action.payload;
};

export const updateJoinWorkspaceCardVisible = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isJoinWorkspaceCardVisible = action.payload;
};

export const updateIsProductHuntLaunchedBannerClosed = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isProductHuntLaunchedBannerClosed = action.payload;
};

export const updateExtensionInstallSource = (prevState: GlobalSliceState, action: { payload: string }) => {
  prevState.misc.persist.extensionInstallSource = action.payload;
};

export const updateTimeToResendEmailLogin = (prevState: GlobalSliceState, action: { payload: number }) => {
  prevState.misc.nonPersist.timeToResendEmailLogin = action.payload;
};

export const updateAppNotificationBannerDismissTs = (prevState: GlobalSliceState, action: { payload: number }) => {
  prevState.misc.persist.appNotificationBannerDismissTs = action.payload;
};

export const updateIsOrgBannerDismissed = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isOrgBannerDismissed = action.payload;
};

export const updatePlanExpiredBannerClosed = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isPlanExpiredBannerClosed = action.payload;
};

export const updateIsManageBillingTeamAlertVisible = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isManageBillingTeamAlertVisible = action.payload;
};

export const updateIsAppBannerVisible = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.nonPersist.isAppBannerVisible = action.payload;
};

export const updateIsSupportChatOpened = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isSupportChatOpened = action.payload;
};

export const updateIsCodeEditorFullScreenModeOnboardingCompleted = (
  prevState: GlobalSliceState,
  action: { payload: boolean }
) => {
  prevState.misc.persist.isCodeEditorFullScreenModeOnboardingCompleted = action.payload;
};

export const updateBillingTeamNudgeLastSeenTs = (prevState: GlobalSliceState, action: { payload: number }) => {
  prevState.misc.persist.billingTeamNudgeLastSeenTs = action.payload;
};

export const updateIsSlackConnectButtonVisible = (prevState: GlobalSliceState, action: { payload: boolean }) => {
  prevState.misc.persist.isSlackConnectButtonVisible = action.payload;
};
