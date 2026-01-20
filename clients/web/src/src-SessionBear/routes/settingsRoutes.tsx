import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { SessionBearSettingsIndex } from "src-SessionBear/layouts/DashboardLayout/features/settings";
import { SessionsSettings } from "features/settings/components/SessionsBookSettings";
import MyTeams from "features/settings/components/WorkspaceSettings/components/MyTeams";
import ConfigurationPage from "views/features/sessions/ConfigurationPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import Profile from "features/settings/components/Profile";

const isSessionsNewSettingsPageCompatible = isFeatureCompatible(FEATURES.SESSION_ONBOARDING);

export const settingsRoutes: RouteObject[] = [
  {
    path: PATHS.SETTINGS.RELATIVE,
    element: <SessionBearSettingsIndex />,
    children: [
      {
        path: PATHS.SETTINGS.SESSIONS_SETTINGS.RELATIVE,
        element: (
          <ProtectedRoute component={isSessionsNewSettingsPageCompatible ? SessionsSettings : ConfigurationPage} />
        ),
      },
      {
        path: PATHS.SETTINGS.WORKSPACES.RELATIVE,
        element: <ProtectedRoute component={MyTeams} />,
      },
      {
        path: PATHS.SETTINGS.PROFILE.RELATIVE,
        element: <ProtectedRoute component={Profile} />,
      },
    ],
  },
];
