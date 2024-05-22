import APP_CONSTANTS from "config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// SUB
const appListJson = require("./sub/appsList.json");

const INITIAL_STATE = {
  /* User */
  user: {
    loggedIn: false,
    details: null,
  },

  userPersona: {
    page: "getting_started",
    persona: "",
    isSurveyCompleted: false,
  },

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
      errors: {},
    },
    rulesToPopulate: [],
    groupwiseRulesToPopulate: {},
    selectedRules: {},
    selectedGroups: {},
    lastBackupTimeStamp: "",
    isRulesListLoading: false,
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

  initializations: {
    auth: false,
  },

  userPreferences: {
    isSecondarySidebarCollapsed: false,
    isRedirectRuleTutorialModalShown: false,
  },

  userAttributes: {
    deviceId: null,
  },

  workspaceOnboarding: {
    step: "auth",
    isOnboardingCompleted: false,
    workspace: {},
  },

  appOnboarding: {
    step: "auth",
    persona: null,
    disableSkip: false,
    createdWorkspace: null,
    isOnboardingCompleted: false,
  },

  editorToast: {},

  misc: {
    persist: {
      isPlanExpiredBannerClosed: false,
      appNotificationBannerDismissTs: 0,
      isProductHuntLaunchedBannerClosed: false,
      isRedirectRuleTourCompleted: false,
      isTrafficTableTourCompleted: false,
      isConnectedAppsTourCompleted: false,
      isNetworkSessionTooltipShown: false,
      isRuleEditorTourCompleted: false,
      extensionInstallSource: null,
      isMiscTourCompleted: {
        firstDraftSession: false,
        askAI: false,
        upgradeWorkspaceMenu: false,
      },

      hasConnectedApp: false,
      lastSeenInviteTs: 0,
      isJoinWorkspaceCardVisible: true,
    },
    nonPersist: {
      networkSessionSaveInProgress: false, // todo: check if requried
      timeToResendEmailLogin: 0,
      isCommandBarOpen: false,
      isAppBannerVisible: false,
    },
  },
};

export default INITIAL_STATE;
