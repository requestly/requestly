import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import Page403 from "views/misc/ServerResponses/403";
import Page404 from "views/misc/ServerResponses/404";
import RootComponent from "src-SessionBear/components/RootComponent";
import Goodbye from "components/misc/Goodbye";

export const miscRoutes: RouteObject[] = [
  {
    path: PATHS.ROOT,
    element: <RootComponent />,
  },
  {
    path: PATHS.INDEX_HTML,
    element: <RootComponent />,
  },
  {
    path: PATHS.GOODBYE.RELATIVE,
    element: <Goodbye />,
  },
  {
    path: PATHS.PAGE403.RELATIVE,
    element: <Page403 />,
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
