import APP_CONSTANTS from "./config/constants";
import { Navigate } from "react-router";
import AcceptTeamInviteView from "./views/user/Teams/AcceptInvite";
import Account from "./views/user/Account";
import AppModeView from "./views/misc/AppMode";
import AuthPageView from "./views/auth/authPage";
import DesktopSignInView from "./views/auth/desktopSignIn";
import EmailAction from "./views/misc/EmailAction";
import FilesListIndex from "./views/features/filesLibrary/FilesListIndex";
import FilesLibIndex from "./views/features/filesLibrary/FilesLibIndex";
import FileViewer from "./views/features/filesLibrary/FileViewer";
import Goodbye from "components/misc/Goodbye";
import Home from "components/misc/Home";
import InstallExtensionCTA from "components/misc/InstallExtensionCTA";
import Feedback from "./views/misc/Feedback";
import ManageLicense from "./views/user/ManageLicense";
import Templates from "./views/landing/RuleTemplates";
import MyTeamsView from "./views/user/Account/Teams/MyTeams";
import Page404 from "./views/misc/ServerResponses/404";
import Page403 from "./views/misc/ServerResponses/403";
import PersonalSubscription from "./views/user/Account/PersonalSubscription";
import Pricing from "./views/landing/Pricing";
import Backup from "./views/user/Backup";
import RefreshSubscriptionView from "./views/misc/payments/RefreshSubscription";
import RulesIndexView from "./views/features/rules/RulesIndexView";
import RuleEditor from "./views/features/rules/RuleEditor";
import Settings from "./views/user/Settings";
import SharedListsIndexView from "./views/features/sharedLists/SharedListsIndexView";
import SharedListImportView from "./views/features/sharedLists/SharedListImportView";
import TrashIndexView from "views/features/trash/TrashIndexView";
import SharedListViewer from "./views/features/sharedLists/SharedListViewer";
import TeamViewerIndex from "./views/user/Account/Teams/TeamViewerIndex";
import VerifyEmail from "./views/misc/VerifyEmail";
import SignInViaEmailLink from "./views/misc/SignInViaEmailLink";
import UpdatePaymentMethodView from "./views/misc/payments/UpdatePaymentMethod";
import UpdateSubscriptionContactUsView from "./views/misc/payments/UpdateSubscriptionContactUs";
import MySourcesView from "./views/mode-specific/desktop/MySourcesView";
import InterceptTrafficView from "./views/mode-specific/desktop/InterceptTrafficView";
import ManualSetupView from "./views/mode-specific/desktop/ManualSetupView";
// import MyOrganizationView from "views/user/Organization/MyOrganization"
import MobileDebuggerCreateApp from "views/features/mobileDebugger/createApp";
import MobileDebuggerHomeView from "views/features/mobileDebugger/home";
import MobileDebuggerDashboardView from "views/features/mobileDebugger";
import MobileDebuggerInterceptorView from "views/features/mobileDebugger/features/interceptor";
import MobileDebuggerUnauthorized from "components/features/mobileDebugger/screens/unauthorized";
import { DraftSessionViewer, SavedSessionViewer } from "views/features/sessions/SessionViewer";
import SessionsHomeView from "./views/features/sessions";
import Updates from "views/features/Updates";
import DesktopPreference from "views/user/Settings/DesktopPreferences";
import ExtensionInstalled from "components/misc/ExtensionInstalled";
import MockEditorEditView from "views/features/mocksV2/MockEditorEditView";
import MockEditorCreateView from "views/features/mocksV2/MockEditorCreateView";
import CreateWorkspace from "components/user/Teams/CreateWorkspace";
import MockListView from "views/features/mocksV2/MockListView";
import RuleSelection from "views/landing/RuleSelection";
import FileMockListView from "views/features/mocksV2/FileMockListView";
import FileMockEditorCreateView from "views/features/mocksV2/FileMockEditorCreateView";
import FileMockEditorEditView from "views/features/mocksV2/FileMockEditorEditView";
import GettingStarted from "components/features/rules/GettingStarted";
import InviteView from "views/misc/Invite";
import APIsView from "views/features/apis/APIsView";

//CONSTANTS
const { PATHS, AUTH } = APP_CONSTANTS;

var routes = [
  {
    path: PATHS.RULE_EDITOR.RELATIVE + "/" + PATHS.ANY,
    name: "Rule Editor",
    icon: "ni ni-ui-04 text-blue",
    component: RuleEditor,
  },
  {
    path: PATHS.ONBOARDING.RELATIVE,
    name: "Onboarding",
    icon: "ni ni-bullet-list-67",
    component: () => <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE} />,
  },
  {
    path: PATHS.EXTENSION_INSTALLED.RELATIVE,
    name: "extension-installed",
    icon: "ni ni-bullet-list-67",
    component: ExtensionInstalled,
  },
  {
    path: PATHS.HOME.ABSOLUTE,
    name: "Home",
    icon: "ni ni-tv-2 text-primary",
    component: Home,
  },
  {
    path: PATHS.UPDATES.RELATIVE,
    name: "Updates",
    icon: "ni ni-tv-2 text-primary",
    component: Updates,
  },
  {
    path: PATHS.RULES.MY_RULES.ABSOLUTE,
    name: "Rules",
    icon: "fas fa-exchange-alt",
    component: RulesIndexView,
  },
  {
    path: PATHS.RULES.TEMPLATES.ABSOLUTE,
    name: "Templates",
    icon: "far fa-file-alt",
    component: Templates,
  },
  {
    path: PATHS.RULES.RELATIVE,
    name: "Rules",
    icon: "fas fa-exchange-alt",
    component: () => <Navigate to={PATHS.RULES.MY_RULES.ABSOLUTE + `${window.location.search}`} />,
  },
  {
    path: PATHS.INSTALL_EXTENSION.RELATIVE,
    name: "Install Extension",
    icon: "fas fa-store-alt",
    component: InstallExtensionCTA,
  },
  {
    path: PATHS.MARKETPLACE.RELATIVE,
    name: "Marketplace",
    icon: "fas fa-store-alt",
    component: () => <Navigate to={PATHS.RULES.TEMPLATES.ABSOLUTE} />,
  },
  {
    path: PATHS.RULES.TRASH.ABSOLUTE,
    name: "Trash",
    icon: "fas fa-trash-alt",
    component: TrashIndexView,
  },
  {
    path: PATHS.FILES.VIEWER.RELATIVE + "/" + PATHS.ANY,
    name: "File Viewer",
    icon: "ni ni-folder-17",
    component: FileViewer,
  },
  // {
  //   path: PATHS.FILES.MY_FILES.ABSOLUTE,
  //   name: "Files",
  //   icon: "fas fa-folder-open",
  //   component: () => <Navigate to={PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE} />,
  // },
  // {
  //   path: PATHS.FILES.RELATIVE,
  //   name: "Mock APIs",
  //   icon: "fas fa-server",
  //   component: () => <Navigate to={PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE} />,
  // },
  {
    path: PATHS.MOCK_SERVER.VIEWER.RELATIVE + "/" + PATHS.ANY,
    name: "Mock Server",
    icon: "ni ni-folder-17",
    component: FileViewer,
  },
  {
    path: PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE,
    name: "API Mocks",
    icon: "fas fa-folder-open",
    component: FilesListIndex,
  },
  {
    path: PATHS.FILES.MY_FILES.ABSOLUTE,
    name: "File Mocks",
    icon: "fas fa-folder-open",
    component: FilesLibIndex,
  },
  {
    path: PATHS.MOCK_SERVER.RELATIVE,
    name: "Mock Server",
    icon: "fas fa-server",
    component: () => <Navigate to={PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE} />,
  },
  {
    path: PATHS.FILES.RELATIVE,
    name: "File Mocks",
    icon: "fas fa-server",
    component: () => <Navigate to={PATHS.FILES.MY_FILES.ABSOLUTE} />,
  },
  {
    path: PATHS.SHARED_LISTS.VIEWER.RELATIVE + "/" + PATHS.ANY,
    name: "Shared Lists Viewer",
    icon: "ni ni-curved-next",
    component: SharedListViewer,
  },
  {
    path: PATHS.SHARED_LISTS.MY_LISTS.ABSOLUTE,
    name: "Sharing",
    icon: "fas fa-share-alt",
    component: SharedListsIndexView,
  },
  {
    path: PATHS.SHARED_LISTS.IMPORT_LIST.ABSOLUTE,
    name: "Sharing",
    icon: "fas fa-share-alt",
    component: SharedListImportView,
  },
  {
    path: PATHS.SHARED_LISTS.RELATIVE,
    name: "Sharing",
    icon: "fas fa-share-alt",
    component: () => <Navigate to={PATHS.SHARED_LISTS.MY_LISTS.ABSOLUTE} />,
  },
  {
    path: PATHS.BACKUP.RELATIVE,
    name: "Data Backup",
    icon: "ni ni-archive-2 text-purple",
    component: () => <Navigate to={PATHS.ACCOUNT.MY_BACKUPS.ABSOLUTE} />,
  },
  {
    path: PATHS.PRICING.RELATIVE,
    name: "Pricing",
    icon: "ni ni-lock-circle-open text-red",
    component: Pricing,
  },
  {
    path: PATHS.LICENSE.MANAGE.RELATIVE,
    name: "Manage License",
    icon: "ni ni-lock-circle-open text-red",
    component: ManageLicense,
  },
  {
    path: PATHS.LICENSE.RELATIVE,
    name: "License",
    icon: "ni ni-lock-circle-open text-red",
    component: () => <Navigate to={PATHS.ACCOUNT.MY_TEAMS.RELATIVE} />,
  },
  {
    path: PATHS.SETTINGS.STORAGE_SETTINGS.RELATIVE,
    name: "Storage Settings",
    icon: "ni ni-lock-circle-open text-red",
    component: Settings,
  },
  {
    path: PATHS.SETTINGS.DESKTOP_PREFERENCES.RELATIVE,
    name: "Storage Settings",
    icon: "ni ni-lock-circle-open text-red",
    component: DesktopPreference, // give wrapper in views
  },
  {
    path: PATHS.SETTINGS.RELATIVE,
    name: "Settings",
    icon: "ni ni-lock-circle-open text-red",
    component: Settings,
  },
  {
    path: PATHS.SESSIONS.ABSOLUTE,
    component: SessionsHomeView,
  },
  {
    path: PATHS.SESSIONS.DRAFT.RELATIVE + "/:tabId",
    component: DraftSessionViewer,
  },
  {
    path: PATHS.SESSIONS.SAVED.RELATIVE + "/:id",
    component: SavedSessionViewer,
  },
  {
    path: PATHS.GOODBYE.RELATIVE,
    name: "Goodbye",
    icon: "ni ni-lock-circle-open text-red",
    component: Goodbye,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.RELATIVE + "/:teamId",
    name: "Manage Team",
    icon: "ni ni-lock-circle-open text-red",
    component: TeamViewerIndex,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.ABSOLUTE,
    name: "Manage Team",
    icon: "ni ni-lock-circle-open text-red",
    component: () => <Navigate to={PATHS.ACCOUNT.MY_TEAMS.RELATIVE} />,
  },
  {
    path: PATHS.ACCOUNT.MY_TEAMS.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: MyTeamsView,
    name: "My Teams",
  },
  {
    path: PATHS.ACCOUNT.CREATE_NEW_TEAM_WORKSPACE.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: CreateWorkspace,
    name: "Create New Workspace",
  },
  {
    path: PATHS.ACCOUNT.PERSONAL_SUBSCRIPTION.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: PersonalSubscription,
    name: "My Personal Subscription",
  },
  {
    path: PATHS.ACCOUNT.UPDATE_SUBSCRIPTION.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: UpdateSubscriptionContactUsView,
    name: "Update Subscriptions",
  },
  {
    path: PATHS.ACCOUNT.UPDATE_SUBSCRIPTION_CONTACT_US.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: UpdateSubscriptionContactUsView,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_PAYMENT_METHOD.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: UpdatePaymentMethodView,
    name: "Update Payment Method",
  },
  {
    path: PATHS.ACCOUNT.REFRESH_SUBSCRIPTION.RELATIVE,
    icon: "ni ni-lock-circle-open text-red",
    component: RefreshSubscriptionView,
    name: "Refresh Subscription",
  },
  {
    path: PATHS.ACCOUNT.CHECKOUT.RELATIVE,
    name: "Checkout",
    icon: "ni ni-lock-circle-open text-red",
    component: () => {
      window.location.href = APP_CONSTANTS.LINKS.CONTACT_US_PAGE;
      return null;
    },
  },
  {
    path: PATHS.ACCOUNT.MY_ACCOUNT.RELATIVE,
    name: "Manage Account",
    icon: "ni ni-lock-circle-open text-red",
    component: Account,
  },
  // {
  //   path: PATHS.ACCOUNT.MY_ORGANIZATION.RELATIVE,
  //   name: "My Organization",
  //   icon: "ni ni-lock-circle-open text-red",
  //   component: MyOrganizationView,
  // },

  {
    path: PATHS.ACCOUNT.MY_BACKUPS.RELATIVE,
    name: "My Backups",
    icon: "ni ni-lock-circle-open text-red",
    component: Backup,
  },
  {
    path: PATHS.ACCOUNT.RELATIVE,
    name: "Manage Account",
    icon: "ni ni-lock-circle-open text-red",
    component: () => <Navigate to={PATHS.ACCOUNT.MY_ACCOUNT.ABSOLUTE} />,
  },
  {
    path: PATHS.AUTH.SIGN_IN.RELATIVE,
    name: "Sign in",
    icon: "ni ni-lock-circle-open text-red",
    component: AuthPageView,
    props: {
      authMode: AUTH.ACTION_LABELS.LOG_IN,
    },
  },
  {
    path: PATHS.AUTH.DEKSTOP_SIGN_IN.RELATIVE,
    name: "Sign in",
    icon: "ni ni-lock-circle-open text-red",
    component: DesktopSignInView,
  },
  {
    path: PATHS.AUTH.SIGN_UP.RELATIVE,
    name: "Sign Up",
    icon: "ni ni-lock-circle-open text-red",
    component: AuthPageView,
    props: {
      authMode: AUTH.ACTION_LABELS.SIGN_UP,
    },
  },
  {
    path: PATHS.AUTH.FORGOT_PASSWORD.RELATIVE,
    name: "Forgot Password",
    icon: "ni ni-lock-circle-open text-red",
    component: AuthPageView,
    props: {
      authMode: AUTH.ACTION_LABELS.REQUEST_RESET_PASSWORD,
    },
  },
  {
    path: PATHS.AUTH.EMAIL_ACTION.RELATIVE,
    name: "Email Action",
    icon: "ni ni-lock-circle-open text-red",
    component: EmailAction,
  },
  {
    path: PATHS.AUTH.RESET_PASSWORD.RELATIVE,
    name: "Reset Password",
    icon: "ni ni-lock-circle-open text-red",
    component: AuthPageView,
    props: {
      authMode: AUTH.ACTION_LABELS.DO_RESET_PASSWORD,
    },
  },
  {
    path: PATHS.AUTH.VERIFY_EMAIL.RELATIVE,
    name: "Verify E-mail",
    icon: "ni ni-lock-circle-open text-red",
    component: VerifyEmail,
  },
  {
    path: PATHS.AUTH.EMAIL_LINK_SIGNIN.RELATIVE,
    name: "Sign in via email link",
    icon: "ni ni-lock-circle-open text-red",
    component: SignInViaEmailLink,
  },
  {
    path: PATHS.PAGE404.RELATIVE,
    name: "404",
    icon: "ni ni-lock-circle-open text-red",
    component: Page404,
  },
  {
    path: PATHS.PAGE403.RELATIVE,
    name: "403",
    icon: "ni ni-lock-circle-open text-red",
    component: Page403,
    layout: PATHS.LANDING,
    showLinkInSidebar: false,
  },
  {
    path: PATHS.ACCEPT_TEAM_INVITE.RELATIVE,
    name: "Join a Team",
    icon: "ni ni-lock-circle-open text-red",
    component: AcceptTeamInviteView,
  },
  {
    path: PATHS.ACCOUNT.SUPPORT.RELATIVE,
    name: "Requestly Support",
    icon: "ni ni-support-16 text-red",
    component: () => {
      window.location.href = APP_CONSTANTS.LINKS.CONTACT_US_PAGE;
      return null;
    },
  },
  {
    path: PATHS.APP_MODE.RELATIVE,
    name: "App Mode",
    icon: "ni ni-support-16 text-red",
    component: AppModeView,
  },
  {
    path: PATHS.DESKTOP.MANUAL_SETUP.RELATIVE,
    name: "Manual Setup",
    icon: "ni ni-support-16 text-red",
    component: ManualSetupView,
  },
  {
    path: PATHS.DESKTOP.MY_APPS.ABSOLUTE,
    name: "Manage Proxy Apps",
    icon: "ni ni-support-16 text-red",
    component: MySourcesView,
  },
  {
    path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE,
    name: "Intercept Traffic",
    icon: "ni ni-support-16 text-red",
    component: InterceptTrafficView,
  },
  {
    path: PATHS.DESKTOP.RELATIVE,
    name: "Manage Proxy Apps",
    icon: "ni ni-support-16 text-red",
    component: () => <Navigate to={PATHS.DESKTOP.MY_APPS.ABSOLUTE} />,
  },
  {
    path: PATHS.FEEDBACK.RELATIVE,
    name: "Feedback",
    icon: "ni ni-support-16 text-red",
    component: Feedback,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.RELATIVE,
    name: "Mobile Interceptor",
    icon: "ni ni-lock-circle-open text-red",
    component: MobileDebuggerDashboardView,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.HOME.RELATIVE,
    name: "Mobile Interceptor Home",
    icon: "ni ni-lock-circle-open text-red",
    component: MobileDebuggerHomeView,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.INTERCEPTOR.RELATIVE,
    name: "Mobile Interceptor Interceptor",
    icon: "ni ni-lock-circle-open text-red",
    component: MobileDebuggerInterceptorView,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.UNAUTHORIZED.RELATIVE,
    name: "Mobile Debugger Unauthorized",
    icon: "ni ni-lock-circle-open text-red",
    component: MobileDebuggerUnauthorized,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.NEW.RELATIVE,
    name: "Create App",
    icon: "ni ni-lock-circle-open text-red",
    component: MobileDebuggerCreateApp,
  },
  /** MOCKS V2 */
  {
    path: PATHS.MOCK_SERVER_V2.CREATE.RELATIVE,
    name: "Mock Create",
    icon: "ni ni-lock-circle-open text-red",
    component: MockEditorCreateView,
  },
  {
    path: PATHS.MOCK_SERVER_V2.EDIT.RELATIVE,
    name: "Mock Edit",
    icon: "ni ni-lock-circle-open text-red",
    component: MockEditorEditView,
  },
  {
    path: PATHS.MOCK_SERVER_V2.RELATIVE,
    name: "Mocks",
    icon: "ni ni-lock-circle-open text-red",
    component: MockListView,
  },
  /** APIs */
  {
    path: PATHS.APIS.RELATIVE,
    name: "APIs",
    icon: "ni ni-lock-circle-open text-red",
    component: APIsView,
  },
  /*******/
  {
    path: PATHS.RULES.CREATE,
    name: "Rule selection",
    component: RuleSelection,
  },
  /** FILES V2 */
  {
    path: PATHS.FILE_SERVER_V2.CREATE.RELATIVE,
    name: "Mock Create",
    icon: "ni ni-lock-circle-open text-red",
    component: FileMockEditorCreateView,
  },
  {
    path: PATHS.FILE_SERVER_V2.EDIT.RELATIVE,
    name: "Mock Edit",
    icon: "ni ni-lock-circle-open text-red",
    component: FileMockEditorEditView,
  },
  {
    path: PATHS.FILE_SERVER_V2.RELATIVE,
    name: "Mocks",
    icon: "ni ni-lock-circle-open text-red",
    component: FileMockListView,
  },
  /*******/
  {
    path: PATHS.GETTING_STARTED,
    name: "Getting started",
    component: GettingStarted,
  },
  {
    path: PATHS.INVITE.RELATIVE,
    name: "Accept Invite",
    component: InviteView,
  },
];
export default routes;
