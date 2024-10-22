import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { EnvironmentView } from "./screens/environment/environmentView";
import { EmptyEnvironmentView } from "./screens/environment/components/emptyEnvironmentView/EmptyEnvironmentView";

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE,
    element: <ApiClientFeatureContainer />,
    children: [
      {
        index: true,
        element: <APIClient />,
      },
      {
        path: PATHS.API_CLIENT.REQUEST.INDEX,
        element: <ProtectedRoute component={APIClient} />,
      },
      {
        path: PATHS.API_CLIENT.HISTORY.INDEX,
        element: <APIClient />,
      },
      {
        path: PATHS.API_CLIENT.ENVIRONMENTS.INDEX,
        element: <EmptyEnvironmentView />,
      },
      {
        path: PATHS.API_CLIENT.ENVIRONMENTS.INDEX + "/:envId",
        element: <EnvironmentView />,
      },
      {
        path: PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE,
        element: <EnvironmentView />,
      },
    ],
  },
];
