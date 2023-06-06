import { RouteObject } from "react-router-dom";
import { ruleRoutes } from "./ruleRoutes";
import { sessionRoutes } from "./sessionRoutes";
import { apiClientRoutes } from "./apiClientRoutes";
import { accountRoutes } from "./accountRoutes";

export const updatedRoutes: RouteObject[] = [...ruleRoutes, ...sessionRoutes, ...apiClientRoutes, ...accountRoutes];
