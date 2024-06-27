import { RouteObject } from "react-router-dom";
import { sessionRoutes } from "./sessionRoutes";
import { miscRoutes } from "./miscRoutes";
import { authRoutes } from "routes/authRoutes";
import { settingsRoutes } from "./settingsRoutes";

export const sessionBearRoutes: RouteObject[] = [...sessionRoutes, ...miscRoutes, ...authRoutes, ...settingsRoutes];
