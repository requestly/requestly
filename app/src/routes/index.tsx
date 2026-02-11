import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

import PATHS from "config/constants/sub/paths";
import RouterError from "components/misc/PageError/RouterError";

/**
 * Performance-optimized routing:
 * - Route configurations are imported synchronously (small footprint - just config objects)
 * - Components are lazy-loaded via React.lazy (large code - split into chunks)
 * - Bundler automatically code-splits route modules for optimal loading
 */

// Import route configurations (these are just arrays of route objects, minimal size)
import { ruleRoutes } from "features/rules/routes";
import { sessionRoutes } from "features/sessionBook";
import { apiClientRoutes } from "features/apiClient";
import { networkInspectorRoutes } from "features/networkInspector";
import { accountRoutes } from "./accountRoutes";
import { authRoutes } from "./authRoutes";
import { desktopRoutes } from "./desktopRoutes";
import { desktopSessionsRoutes } from "./desktopSessionRoutes";
import { mockServerRoutes } from "features/mocks/routes";
import { onboardingRoutes } from "./onboardingRoutes";
import { settingRoutes } from "features/settings/routes";
import { miscRoutes } from "./miscRoutes";
import { inviteRoutes } from "./inviteRoutes";
import { paymentRoutes } from "./paymentRoutes";
import { automationRoutes } from "views/misc/Automation/routes";

/* ---------- Layouts (lazy) ---------- */
const AppLayout = lazy(() => import("layouts/AppLayout"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const FullScreenLayout = lazy(() => import("layouts/FullScreenLayout"));
const MinimalLayout = lazy(() => import("layouts/MinimalLayout"));

/* ---------- Misc screens (lazy) ---------- */
const SeleniumImporter = lazy(() => import("views/misc/SeleniumImporter"));
const ExtensionInstalledScreen = lazy(() => import("views/misc/ExtensionInstalledScreen"));
const AutomationTemplate = lazy(() => import("views/misc/Automation/layout"));
const BStackAuthStart = lazy(() =>
  import("features/onboarding/screens/BStackAuthStart/BStackAuthStart").then((m) => ({ default: m.BStackAuthStart }))
);

/* ---------- Shared fallback ---------- */
const withSuspense = (element: React.ReactElement) => <Suspense fallback={<>loading</>}>{element}</Suspense>;

export const routesV2: RouteObject[] = [
  /** Misc */
  {
    path: PATHS._INSTALLED_EXTENSION.RELATIVE,
    element: withSuspense(<ExtensionInstalledScreen />),
  },
  {
    path: PATHS.SELENIUM_IMPORTER.RELATIVE,
    element: withSuspense(<SeleniumImporter />),
  },
  {
    path: PATHS.AUTOMATION.RELATIVE,
    element: withSuspense(<AutomationTemplate />),
    children: automationRoutes,
  },

  /** App */
  {
    path: "",
    element: withSuspense(<AppLayout />),
    errorElement: <RouterError />,
    children: [
      /** Dashboard */
      {
        path: "",
        element: withSuspense(<DashboardLayout />),
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

      /** Minimal layout */
      {
        path: "",
        element: withSuspense(<MinimalLayout />),
        children: [...inviteRoutes, ...paymentRoutes],
      },

      /** Fullscreen (non-iframe) */
      {
        path: "",
        element: withSuspense(<FullScreenLayout />),
        children: [
          {
            path: PATHS.AUTH.START.RELATIVE,
            element: withSuspense(<BStackAuthStart />),
          },
        ],
      },

      /** Iframe */
      {
        path: "iframe",
        element: withSuspense(<FullScreenLayout />),
        children: [...sessionRoutes],
      },
    ],
  },
];
