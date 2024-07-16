import { RouteObject } from "react-router-dom";
import { sessionRoutes } from "features/sessionBook";
import { miscRoutes } from "./miscRoutes";
import { authRoutes } from "routes/authRoutes";
import { settingsRoutes } from "./settingsRoutes";
import { accountRoutes } from "routes/accountRoutes";

export const sessionBearRoutes: RouteObject[] = [
  ...sessionRoutes,
  ...miscRoutes,
  ...authRoutes,
  ...settingsRoutes,
  ...accountRoutes,
];
