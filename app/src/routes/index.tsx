import { Navigate, RouteObject } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";
import PATHS from "config/constants/sub/paths";
import SeleniumImporter from "views/misc/SeleniumImporter";
import { automationRoutes } from "views/misc/Automation/routes";
import AppLayout from "layouts/AppLayout";
import { ruleRoutes } from "features/rules/routes";
import { sessionRoutes } from "features/sessionBook";
import { apiClientRoutes } from "features/apiClient";
import { accountRoutes } from "./accountRoutes";
import { authRoutes } from "./authRoutes";
import { desktopRoutes } from "./desktopRoutes";
import { mockServerRoutes } from "features/mocks/routes";
import { onboardingRoutes } from "./onboardingRoutes";
import { settingRoutes } from "features/settings/routes";
import { miscRoutes } from "./miscRoutes";
import { desktopSessionsRoutes } from "./desktopSessionRoutes";
import { inviteRoutes } from "./inviteRoutes";
import MinimalLayout from "layouts/MinimalLayout";
import { paymentRoutes } from "./paymentRoutes";
import { networkInspectorRoutes } from "features/networkInspector";
import RouterError from "components/misc/PageError/RouterError";
import { BStackAuthStart } from "features/onboarding/screens/BStackAuthStart/BStackAuthStart";
import AutomationTemplate from "views/misc/Automation/layout";

export const routesV2: RouteObject[] = [
  /** Misc **/
  {
    path: PATHS._INSTALLED_EXTENSION.RELATIVE,
    element: <Navigate to={PATHS.HOME.ABSOLUTE} replace />,
  },
  {
    path: PATHS.SELENIUM_IMPORTER.RELATIVE,
    element: <SeleniumImporter />,
  },
  {
    path: PATHS.AUTOMATION.RELATIVE,
    element: <AutomationTemplate />,
    children: [...automationRoutes],
  },
  {
    path: "",
    element: <AppLayout />,
    errorElement: <RouterError />,
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
          ...networkInspectorRoutes,
        ],
      },
      {
        path: "",
        element: <MinimalLayout />,
        children: [...inviteRoutes, ...paymentRoutes],
      },
      /**  non-iframe full screen routes **/
      {
        path: "",
        element: <FullScreenLayout />,
        children: [
          {
            path: PATHS.AUTH.START.RELATIVE,
            element: <BStackAuthStart />,
          },
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
