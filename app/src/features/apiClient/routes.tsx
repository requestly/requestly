import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import ProtectedRoute from "components/authentication/ProtectedRoute";

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
    ],
  },
];
