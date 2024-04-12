import { RouteObject } from "react-router-dom";
import { sessionRoutes } from "./sessionRoutes";
import { apiClientRoutes } from "./apiClientRoutes";
import { accountRoutes } from "./accountRoutes";
import { authRoutes } from "./authRoutes";
import { desktopRoutes } from "./desktopRoutes";
import { onboardingRoutes } from "./onboardingRoutes";
import { miscRoutes } from "./miscRoutes";
import { ruleRoutes } from "features/rules/routes";
import { desktopSessionsRoutes } from "./desktopSessionRoutes";
import { settingRoutes } from "features/settings/routes";
import { mockServerRoutes } from "features/mocks";

export const routes: RouteObject[] = [
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
];
