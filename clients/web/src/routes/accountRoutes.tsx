import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import MyTeams from "features/settings/components/WorkspaceSettings/components/MyTeams";
import CreateWorkspace from "components/user/Teams/CreateWorkspace";
import PersonalSubscription from "features/settings/components/Profile/PersonalSubscription";
import UpdateSubscriptionContactUs from "components/payments/UpdateSubscriptionContactUs";
import UpdatePaymentMethod from "components/payments/UpdatePaymentMethod";
import ManageAccount from "features/settings/components/Profile";
import TeamViewer from "features/settings/components/Profile/ManageTeams/TeamViewer";
import APP_CONSTANTS from "config/constants";
import ProtectedRoute from "components/authentication/ProtectedRoute";

export const accountRoutes: RouteObject[] = [
  {
    path: PATHS.ACCOUNT.MY_TEAMS.RELATIVE,
    element: <MyTeams />,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.RELATIVE + "/:teamId",
    element: <TeamViewer />,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.ABSOLUTE,
    element: <Navigate to={PATHS.ACCOUNT.MY_TEAMS.RELATIVE} />,
  },
  {
    path: PATHS.ACCOUNT.CREATE_NEW_TEAM_WORKSPACE.RELATIVE,
    element: <CreateWorkspace />,
  },
  {
    path: PATHS.ACCOUNT.PERSONAL_SUBSCRIPTION.RELATIVE,
    element: <PersonalSubscription />,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_SUBSCRIPTION.RELATIVE,
    element: <ProtectedRoute component={UpdateSubscriptionContactUs} />,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_SUBSCRIPTION_CONTACT_US.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.UPDATE_SUBSCRIPTION.RELATIVE} />,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_PAYMENT_METHOD.RELATIVE,
    element: <ProtectedRoute component={UpdatePaymentMethod} />,
  },
  {
    path: PATHS.ACCOUNT.CHECKOUT.RELATIVE,
    //@ts-ignore
    component: () => {
      window.location.href = APP_CONSTANTS.LINKS.CONTACT_US_PAGE;
      return null;
    },
  },
  {
    path: PATHS.ACCOUNT.MY_ACCOUNT.RELATIVE,
    element: <ProtectedRoute component={ManageAccount} />,
  },
  {
    path: PATHS.ACCOUNT.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.MY_ACCOUNT.ABSOLUTE} />,
  },
  {
    path: PATHS.ACCOUNT.SUPPORT.RELATIVE,
    //@ts-ignore
    element: () => {
      window.location.href = APP_CONSTANTS.LINKS.CONTACT_US_PAGE;
      return null;
    },
  },
];
