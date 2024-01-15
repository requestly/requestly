import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SettingsIndexPage from "../components/SettingsIndex";
import { GlobalSettings } from "../components/GlobalSettings";
import { DesktopSettings } from "../components/DesktopSettings";

export const settingRoutes: RouteObject[] = [
  {
    path: PATHS.SETTINGS.RELATIVE,
    element: <SettingsIndexPage />,
    children: [
      {
        path: PATHS.SETTINGS.GLOBAL_SETTINGS.RELATIVE,
        element: <GlobalSettings />,
      },
      {
        path: PATHS.SETTINGS.DESKTOP_SETTINGS.RELATIVE,
        element: <DesktopSettings />,
      },
    ],
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
