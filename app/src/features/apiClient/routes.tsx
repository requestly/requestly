import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ApiClientFeatureContainer from "./container";
import { APIClient } from "./screens/apiClient/APIClient";
import { Environments } from "./screens/environments/Environements";

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
        path: PATHS.API_CLIENT.ENVIRONMENTS.RELATIVE,
        element: <Environments />,
      },
    ],
  },
];
