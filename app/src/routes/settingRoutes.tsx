import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import Settings from "views/user/Settings";

export const settingRoutes: RouteObject[] = [
  {
    path: PATHS.SETTINGS.RELATIVE,
    element: <Settings />,
  },
  {
    path: PATHS.SETTINGS.STORAGE_SETTINGS.RELATIVE,
    element: <Navigate to={PATHS.SETTINGS.STORAGE_SETTINGS.RELATIVE} />,
  },
  {
    path: PATHS.LEGACY.SETTINGS.ABSOLUTE,
    element: <Navigate to={PATHS.SETTINGS.RELATIVE} />,
  },
];
