import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import MyTeamsView from "views/user/Account/Teams/MyTeams";
import CreateWorkspace from "components/user/Teams/CreateWorkspace";
import PersonalSubscription from "components/user/AccountIndexPage/ManageAccount/PersonalSubscription";
import UpdateSubscriptionContactUsView from "views/misc/payments/UpdateSubscriptionContactUs";
import RefreshSubscriptionView from "views/misc/payments/RefreshSubscription";
import UpdatePaymentMethodView from "views/misc/payments/UpdatePaymentMethod";
import Backup from "views/user/Backup";
import Account from "components/user/AccountIndexPage";
import TeamViewerIndex from "views/user/Account/Teams/TeamViewerIndex";
import APP_CONSTANTS from "config/constants";

export const accountRoutes: RouteObject[] = [
  {
    path: PATHS.ACCOUNT.MY_TEAMS.RELATIVE,
    element: <MyTeamsView />,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.RELATIVE + "/:teamId",
    element: <TeamViewerIndex />,
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
    element: <UpdateSubscriptionContactUsView />,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_SUBSCRIPTION_CONTACT_US.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.UPDATE_SUBSCRIPTION.RELATIVE} />,
  },
  {
    path: PATHS.ACCOUNT.UPDATE_PAYMENT_METHOD.RELATIVE,
    element: <UpdatePaymentMethodView />,
  },
  {
    path: PATHS.ACCOUNT.REFRESH_SUBSCRIPTION.RELATIVE,
    element: <RefreshSubscriptionView />,
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
    element: <Account />,
  },
  {
    path: PATHS.ACCOUNT.MY_BACKUPS.RELATIVE,
    element: <Backup />,
  },
  {
    path: PATHS.ACCOUNT.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.MY_ACCOUNT.ABSOLUTE} />,
  },
  {
    path: PATHS.LICENSE.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.MY_TEAMS.RELATIVE} />,
  },
  {
    path: PATHS.BACKUP.RELATIVE,
    element: <Navigate to={PATHS.ACCOUNT.MY_BACKUPS.ABSOLUTE} />,
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
