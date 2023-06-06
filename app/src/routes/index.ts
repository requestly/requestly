import { RouteObject } from "react-router-dom";
import { ruleRoutes } from "./rules-route";
import { sessionRoutes } from "./sessions-route";
import { apiClientRoutes } from "./apiClient-route";
import { accountRoutes } from "./account-route";

export const updatedRoutes: RouteObject[] = [...ruleRoutes, ...sessionRoutes, ...apiClientRoutes, ...accountRoutes];
