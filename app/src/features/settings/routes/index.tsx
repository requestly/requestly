import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SettingsIndexPage from "../components/SettingsIndex";
import { GlobalSettings } from "../components/GlobalSettings";
import { DesktopSettings } from "../components/DesktopSettings";
import { SessionsSettings } from "../components/SessionsBookSettings";
import MyTeams from "../components/WorkspaceSettings/components/MyTeams";
import ConfigurationPage from "views/features/sessions/ConfigurationPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { BillingTeam } from "../components/BillingTeam";

const isSessionsNewSettingsPageCompatible = isFeatureCompatible(FEATURES.SESSION_ONBOARDING);

export const settingRoutes: RouteObject[] = [
  {
    path: PATHS.SETTINGS.RELATIVE,
    element: <SettingsIndexPage />,
    children: [
      {
        path: PATHS.SETTINGS.GLOBAL_SETTINGS.RELATIVE,
        element: <GlobalSettings />,
      },
      {
        path: PATHS.SETTINGS.DESKTOP_SETTINGS.RELATIVE,
        element: <DesktopSettings />,
      },
      {
        path: PATHS.SETTINGS.SESSION_BOOK.RELATIVE,
        element: (
          <ProtectedRoute component={isSessionsNewSettingsPageCompatible ? SessionsSettings : ConfigurationPage} />
        ),
      },
      {
        path: PATHS.SETTINGS.WORKSPACES.RELATIVE,
        element: <ProtectedRoute component={MyTeams} />,
      },
      {
        path: PATHS.SETTINGS.BILLING.RELATIVE,
        element: <BillingTeam />,
      },
      {
        path: PATHS.SETTINGS.BILLING.RELATIVE + "/:billingId",
        element: <BillingTeam />,
      },
    ],
  },
  {
    path: PATHS.SETTINGS.STORAGE_SETTINGS.RELATIVE,
    element: <Navigate to={PATHS.SETTINGS.STORAGE_SETTINGS.RELATIVE} />,
  },
  {
    path: PATHS.LEGACY.SETTINGS.ABSOLUTE,
    element: <Navigate to={PATHS.SETTINGS.RELATIVE} />,
  },
];
