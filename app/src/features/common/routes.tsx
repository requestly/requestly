import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import Goodbye from "components/misc/Goodbye";

export const commonRoutes: RouteObject[] = [
  {
    path: PATHS.GOODBYE.RELATIVE,
    element: <Goodbye />,
  },
];
