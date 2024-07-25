import { RouteObject } from "react-router-dom";

import AppLayout from "src-SessionBear/layouts/AppLayout";
import { sessionRoutes } from "features/sessionBook";
import { miscRoutes } from "./miscRoutes";
import { authRoutes } from "routes/authRoutes";
import { settingsRoutes } from "./settingsRoutes";
import { accountRoutes } from "routes/accountRoutes";
import DashboardLayout from "src-SessionBear/layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";

export const sessionBearRoutes: RouteObject[] = [
  {
    path: "",
    element: <AppLayout />,
    children: [
      /** App Dashboard - Normal Paths **/
      {
        path: "",
        element: <DashboardLayout />,
        children: [...sessionRoutes, ...miscRoutes, ...authRoutes, ...settingsRoutes, ...accountRoutes],
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
