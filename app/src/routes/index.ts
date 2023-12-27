import { RouteObject } from "react-router-dom";
import { ruleRoutes } from "./ruleRoutes";
import { sessionRoutes } from "./sessionRoutes";
import { apiClientRoutes } from "./apiClientRoutes";
import { accountRoutes } from "./accountRoutes";
import { authRoutes } from "./authRoutes";
import { desktopRoutes } from "./desktopRoutes";
import { mobileDebuggerRoutes } from "./mobileDebuggerRoutes";
import { mockServerRoutes } from "./mockServerRoutes";
import { onboardingRoutes } from "./onboardingRoutes";
import { miscRoutes } from "./miscRoutes";
import { settingRoutes } from "./settingRoutes";

export const routes: RouteObject[] = [
  ...ruleRoutes,
  ...sessionRoutes,
  ...apiClientRoutes,
  ...accountRoutes,
  ...authRoutes,
  ...desktopRoutes,
  ...mobileDebuggerRoutes,
  ...mockServerRoutes,
  ...onboardingRoutes,
  ...settingRoutes,
  ...miscRoutes,
];
