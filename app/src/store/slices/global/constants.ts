import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { GlobalSliceState } from "./types";
import appListJson from "../../initial-state/sub/appsList.json";
import { ONBOARDING_STEPS } from "features/onboarding/types";

const INITIAL_GLOBAL_SLICE_STATE: GlobalSliceState = {
  /* User */
  user: {
    loggedIn: false,
    details: null,
  },

  syncingV2: false,

  isExtensionEnabled: true,

  /* App Mode */
  appMode: GLOBAL_CONSTANTS.APP_MODES.EXTENSION,

  /* App Theme */
  appTheme: APP_CONSTANTS.THEMES.DARK,

  /* Rules */
  rules: {
    allRules: {
      rules: [],
      groups: [],
    },
    currentlySelectedRule: {
      data: false,
      config: false,
      hasUnsavedChanges: false,
      isWorkspaceSwitchConfirmationActive: false,
      showDetailsPanel: true,
      errors: {},
    },
    rulesToPopulate: [],
    groupwiseRulesToPopulate: {},
    selectedRules: {},
    selectedGroups: {},
    lastBackupTimeStamp: 0,
    isRulesListLoading: false,
    isSampleRulesImported: false,
  },

  /* Search */
  search: {
    rules: "",
    files: "",
    sharedLists: "",
  },

  /* To force re-render a component */
  pendingRefresh: {
    rules: false,
    sharedLists: false,
    sessionRecordingConfig: false,
  },

  /* To force re-render a component */
  pendingHardRefresh: {
    rules: false,
  },

  /* Shared Lists */
  sharedLists: {
    selectedLists: false,
  },

  /* Toggle and Configure Modals Globally */
  activeModals: {
    loadingModal: {
      isActive: false,
      props: {},
    },
    authModal: {
      isActive: false,
      props: {},
    },
    renameGroupModal: {
      isActive: false,
      props: {},
    },
    extensionModal: {
      isActive: false,
      props: {},
    },
    syncConsentModal: {
      isActive: false,
      props: {},
    },
    personaSurveyModal: {
      isActive: false,
      props: {},
    },
    ruleEditorModal: {
      isActive: false,
      props: {},
    },
    connectedAppsModal: {
      isActive: false,
      props: {},
    },
    workspaceOnboardingModal: {
      isActive: false,
      props: {},
    },
    appOnboardingModal: {
      isActive: false,
      props: {},
    },
    createWorkspaceModal: {
      isActive: false,
      props: {},
    },
    inviteMembersModal: {
      isActive: false,
      props: {},
    },
    switchWorkspaceModal: {
      isActive: false,
      props: {},
    },
    joinWorkspaceModal: {
      isActive: false,
      props: {},
    },
    sharingModal: {
      isActive: false,
      props: {},
    },
    emailLoginLinkPopup: {
      isActive: false,
      props: {},
    },
    pricingModal: {
      isActive: false,
      props: {},
    },
  },

  desktopSpecificDetails: {
    isBackgroundProcessActive: false,
    isProxyServerRunning: false,
    proxyPort: 8080,
    appsList: appListJson,
    availableAppsScanned: false, // @nsr remove completely, as it is now async
    proxyIp: "127.0.0.1",
    isSavingNetworkSession: false,
  },

  // country of current user
  country: "",
  appLanguage: "en",

  initializations: {
    auth: false,
  },

  userPreferences: {
    isSecondarySidebarCollapsed: false,
    isRedirectRuleTutorialModalShown: false,
  },

  userAttributes: {
    device_id: null,
  },

  appOnboarding: {
    step: ONBOARDING_STEPS.AUTH,
    persona: null,
    fullName: null,
    industry: null,
    disableSkip: false,
    createdWorkspace: null,
    isOnboardingCompleted: false,
  },

  onboarding: {
    isOnboardingCompleted: false,
    isNewUser: false,
    userPersona: null,
    isAcquisitionAnnouncementModalVisible: true,
  },

  bottomSheetOrientation: {
    api_client: {
      open: true,
      placement: "right",
      size: [55, 45],
    },
    rules: {
      open: false,
      placement: "bottom",
      size: [70, 30],
    },
  },

  editorToast: {},

  popupConfig: {},

  misc: {
    persist: {
      isOrgBannerDismissed: false,
      isPlanExpiredBannerClosed: false,
      appNotificationBannerDismissTs: 0,
      isProductHuntLaunchedBannerClosed: false,
      isRedirectRuleTourCompleted: false,
      isTrafficTableTourCompleted: false,
      isConnectedAppsTourCompleted: false,
      isNetworkSessionTooltipShown: false,
      isRuleEditorTourCompleted: false,
      isCodeEditorFullScreenModeOnboardingCompleted: false,
      extensionInstallSource: null,
      isMiscTourCompleted: {
        firstDraftSession: false,
        testThisRule: false,
        upgradeWorkspaceMenu: false,
      },
      billingTeamNudgeLastSeenTs: null,
      isSlackConnectButtonVisible: true,

      hasConnectedApp: false,
      lastSeenInviteTs: 0,
      isJoinWorkspaceCardVisible: true,
      isManageBillingTeamAlertVisible: true,
      isSupportChatOpened: false,
      lastUsedFeaturePath: "/",
      hasGeneratedAITests: false,
    },
    nonPersist: {
      networkSessionSaveInProgress: false, // todo: check if requried
      timeToResendEmailLogin: 0,
      isCommandBarOpen: false,
      isAppBannerVisible: false,
      requestBot: { isActive: false, modelType: "app" },
    },
  },
};

export default INITIAL_GLOBAL_SLICE_STATE;
