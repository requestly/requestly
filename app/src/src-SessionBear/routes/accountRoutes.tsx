import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import MyTeams from "features/settings/components/WorkspaceSettings/components/MyTeams";
import CreateWorkspace from "components/user/Teams/CreateWorkspace";
import TeamViewer from "features/settings/components/Profile/ManageTeams/TeamViewer";
import APP_CONSTANTS from "config/constants";
import ProtectedRoute from "components/authentication/ProtectedRoute";

export const accountRoutes: RouteObject[] = [
  {
    path: PATHS.ACCOUNT.MY_TEAMS.RELATIVE,
    element: <ProtectedRoute component={MyTeams} />,
  },
  {
    path: PATHS.ACCOUNT.TEAMS.RELATIVE + "/:teamId",
    element: <ProtectedRoute component={TeamViewer} />,
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
    path: PATHS.ACCOUNT.SUPPORT.RELATIVE,
    //@ts-ignore
    element: () => {
      window.location.href = APP_CONSTANTS.LINKS.CONTACT_US_PAGE;
      return null;
    },
  },
];
