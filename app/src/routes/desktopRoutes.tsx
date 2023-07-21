import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import ManualProxySetup from "components/mode-specific/desktop/ManualProxySetup";
import MySources from "components/mode-specific/desktop/MySources";
import InterceptTraffic from "components/mode-specific/desktop/InterceptTraffic";

export const desktopRoutes: RouteObject[] = [
  {
    path: PATHS.DESKTOP.MANUAL_SETUP.RELATIVE,
    // @ts-ignore
    element: <ManualProxySetup />,
  },
  {
    path: PATHS.DESKTOP.MY_APPS.ABSOLUTE,
    element: <MySources />,
  },
  {
    path: PATHS.DESKTOP.INTERCEPT_TRAFFIC.ABSOLUTE,
    element: <InterceptTraffic />,
  },
  {
    path: PATHS.DESKTOP.RELATIVE,
    element: <Navigate to={PATHS.DESKTOP.MY_APPS.ABSOLUTE} />,
  },
];
