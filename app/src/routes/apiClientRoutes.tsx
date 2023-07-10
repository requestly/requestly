import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import APIClientIndex from "views/features/api-client";

export const apiClientRoutes: RouteObject[] = [
  {
    path: PATHS.API_CLIENT.RELATIVE,
    element: <APIClientIndex />,
  },
];
