import { ONBOARDING_STEPS } from "features/onboarding/types";
import { EditorToastState } from "./editorToast/types";
import { GlobalModals } from "./modals/types";
import { RulesState } from "./rules/types";
import { UserAuth } from "./user/types";
import { SurveyPage } from "components/misc/PersonaSurvey/types";

export interface GlobalSliceState {
  activeModals: GlobalModals;
  editorToast: EditorToastState["editorToast"];
  rules: RulesState;
  user: UserAuth;
  syncingV2: boolean;
  isExtensionEnabled: boolean;
  pendingRefresh: {
    rules: boolean;
    sharedLists: boolean;
    sessionRecordingConfig: boolean;
  };
  pendingHardRefresh: {
    rules: boolean;
  };
  userPreferences: {
    isSecondarySidebarCollapsed: boolean;
    isRedirectRuleTutorialModalShown: boolean;
  };
  userPersona: {
    page: SurveyPage;
    persona: string;
    isSurveyCompleted: boolean;
    useCases: any;
  };
  workspaceOnboarding: {
    step: ONBOARDING_STEPS;
    isOnboardingCompleted: boolean;
    workspace: any;
  };
  appOnboarding: {
    step: ONBOARDING_STEPS;
    persona: null;
    fullName: string;
    industry: string;
    disableSkip: boolean;
    createdWorkspace: any;
    isOnboardingCompleted: boolean;
  };
  misc: {
    persist: {
      isOrgBannerDismissed: boolean;
      isPlanExpiredBannerClosed: boolean;
      appNotificationBannerDismissTs: number;
      isProductHuntLaunchedBannerClosed: boolean;
      isRedirectRuleTourCompleted: boolean;
      isTrafficTableTourCompleted: boolean;
      isConnectedAppsTourCompleted: boolean;
      isNetworkSessionTooltipShown: boolean;
      isRuleEditorTourCompleted: boolean;
      isCodeEditorFullScreenModeOnboardingCompleted: boolean;
      extensionInstallSource: string;
      isMiscTourCompleted: {
        firstDraftSession: boolean;
        testThisRule: boolean;
        upgradeWorkspaceMenu: boolean;
      };
      billingTeamNudgeLastSeenTs: number;
      isSlackConnectButtonVisible: boolean;
      hasConnectedApp: boolean;
      lastSeenInviteTs: number;
      isJoinWorkspaceCardVisible: boolean;
      isManageBillingTeamAlertVisible: boolean;
      isSupportChatOpened: boolean;
      lastFeaturePath: string;
    };
    nonPersist: {
      networkSessionSaveInProgress: boolean;
      timeToResendEmailLogin: number;
      isCommandBarOpen: boolean;
      isAppBannerVisible: boolean;
      requestBot: { isActive: boolean; modelType: "app" };
    };
  };
  userAttributes: any;
  [key: string]: any;
}
