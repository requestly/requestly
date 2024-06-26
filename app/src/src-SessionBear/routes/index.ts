import { RouteObject } from "react-router-dom";
import { sessionRoutes } from "./sessionRoutes";
import { miscRoutes } from "./miscRoutes";
import { settingsRoutes } from "./settingsRoutes";

export const sessionBearRoutes: RouteObject[] = [...sessionRoutes, ...settingsRoutes, ...miscRoutes];
