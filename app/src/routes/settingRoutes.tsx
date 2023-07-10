import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SettingsIndexPage from "views/user/Settings/SettingsIndexPage";

export const settingRoutes: RouteObject[] = [
  {
    path: PATHS.SETTINGS.RELATIVE,
    element: <SettingsIndexPage />,
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
