import { Navigate, RouteObject } from "react-router-dom";
import { sessionRoutes } from "./sessionRoutes";
import PATHS from "config/constants/sub/paths";
import Page404 from "views/misc/ServerResponses/404";
import RootComponent from "components/redirects/RootComponent";

export const sessionBearRoutes: RouteObject[] = [
  ...sessionRoutes,
  {
    path: PATHS.ROOT,
    element: <RootComponent />,
  },
  {
    path: PATHS.INDEX_HTML,
    element: <RootComponent />,
  },
  {
    path: PATHS.PAGE404.RELATIVE,
    element: <Page404 />,
  },
  {
    path: PATHS.ANY,
    element: <Navigate to={PATHS.PAGE404.RELATIVE} />,
  },
];
