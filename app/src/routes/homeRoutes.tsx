import RootComponent from "components/redirects/RootComponent";
import PATHS from "config/constants/sub/paths";
import { RouteObject } from "react-router-dom";

export const homeRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <RootComponent />,
  },
  {
    path: PATHS.INDEX_HTML,
    element: <RootComponent />,
  },
];
