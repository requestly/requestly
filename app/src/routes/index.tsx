import { RouteObject } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";

import PATHS from "config/constants/sub/paths";

import SeleniumImporter from "views/misc/SeleniumImporter";
import AppLayout from "layouts/AppLayout";

import { ruleRoutes } from "features/rules/routes";
import { sessionRoutes } from "features/sessionBook";
import { apiClientRoutes } from "./apiClientRoutes";
import { accountRoutes } from "./accountRoutes";
import { authRoutes } from "./authRoutes";
import { desktopRoutes } from "./desktopRoutes";
import { mockServerRoutes } from "features/mocks/routes";
import { onboardingRoutes } from "./onboardingRoutes";
import { settingRoutes } from "features/settings/routes";
import { miscRoutes } from "./miscRoutes";
import { desktopSessionsRoutes } from "./desktopSessionRoutes";

export const routesV2: RouteObject[] = [
  /** Misc **/
  {
    path: PATHS.SELENIUM_IMPORTER.RELATIVE,
    element: <SeleniumImporter />,
  },
  {
    path: "",
    element: <AppLayout />,
    children: [
      /** App Dashboard - Normal Paths **/
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          ...ruleRoutes,
          ...sessionRoutes,
          ...apiClientRoutes,
          ...accountRoutes,
          ...authRoutes,
          ...desktopRoutes,
          ...mockServerRoutes,
          ...onboardingRoutes,
          ...settingRoutes,
          ...miscRoutes,
          ...desktopSessionsRoutes,
        ],
      },
      /** Iframe paths  - Without Header, Footer **/
      {
        path: "iframe",
        element: <FullScreenLayout />,
        children: [...sessionRoutes],
      },
    ],
  },
];
