import { RouteObject } from "react-router-dom";
import { sessionRoutes } from "./sessionRoutes";
import { miscRoutes } from "./miscRoutes";

export const sessionBearRoutes: RouteObject[] = [...sessionRoutes, ...miscRoutes];
