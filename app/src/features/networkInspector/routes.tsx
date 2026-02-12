import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

// Lazy-loaded components for better code splitting
const NetworkInspectorContainer = lazy(() => import("./container"));
const NetworkInspectorHomeScreen = lazy(() =>
  import("./screens").then((m) => ({ default: m.NetworkInspectorHomeScreen }))
);

export const networkInspectorRoutes: RouteObject[] = [
  {
    path: PATHS.NETWORK_INSPECTOR.INDEX,
    element: <NetworkInspectorContainer />,
    children: [
      {
        index: true,
        element: <NetworkInspectorHomeScreen />,
      },
    ],
  },
];
