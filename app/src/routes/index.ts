import { RouteObject } from "react-router-dom";
import { rulesRoutes } from "./rules.route";
import { sessionsRoutes } from "./sessions.route";

export const updatedRoutes: RouteObject[] = [...rulesRoutes, ...sessionsRoutes];
