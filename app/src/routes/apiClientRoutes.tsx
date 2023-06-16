import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import APIClientContainer from "views/features/api-client/APIClientContainer";

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE,
    element: <APIClientContainer />,
  },
];
