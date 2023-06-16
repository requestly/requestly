import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ManualSetupView from "views/mode-specific/desktop/ManualSetupView";
import MySourcesView from "views/mode-specific/desktop/MySourcesView";
import InterceptTrafficView from "views/mode-specific/desktop/InterceptTrafficView";

export const desktopRoutes: RouteObject[] = [
  {
    path: PATHS.DESKTOP.MANUAL_SETUP.RELATIVE,
    element: <ManualSetupView />,
  },
  {
    path: PATHS.DESKTOP.MY_APPS.ABSOLUTE,
    element: <MySourcesView />,
  },
  {
    path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE,
    element: <InterceptTrafficView />,
  },
  {
    path: PATHS.DESKTOP.RELATIVE,
    element: <Navigate to={PATHS.DESKTOP.MY_APPS.ABSOLUTE} />,
  },
];
