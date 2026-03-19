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
import { BillingTeamContainer } from "../components/BillingTeam";
import { OrgMembersView } from "../components/OrgMembers/OrgMembers";
import Profile from "../components/Profile/ManageAccount";
import { BillingTeamDetails } from "../components/BillingTeam/components/BillingDetails";
import { BillingList } from "../components/BillingTeam/components/BillingList";
import { UserPlanDetails } from "../components/BillingTeam/components/UserPlanDetails";
import { isDesktopMode } from "utils/AppUtils";
import Secrets from "features/settings/secrets-manager";
import SecretsLayout from "../secrets-manager/SecretsLayout";
import ManageProviders from "../secrets-manager/ManageProviders/Index";
import { SecretsModalsProvider } from "../secrets-manager/context/SecretsModalsContext";

const isSessionsNewSettingsPageCompatible = isFeatureCompatible(FEATURES.SESSION_ONBOARDING);
const isSecretsManagerCompatible = isFeatureCompatible(FEATURES.SECRETS_MANAGER);

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

      ...(isSecretsManagerCompatible
        ? [
            {
              path: PATHS.SETTINGS.SECRETS.RELATIVE,
              element: (
                <SecretsModalsProvider>
                  <SecretsLayout />
                </SecretsModalsProvider>
              ),
              children: [
                {
                  index: true,
                  element: <Secrets />,
                },
                ...(isDesktopMode()
                  ? [
                      {
                        path: PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS.RELATIVE, // This is a nested route for managing providers
                        element: <ManageProviders />,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

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
        path: PATHS.SETTINGS.MEMBERS.RELATIVE,
        element: <ProtectedRoute component={OrgMembersView} />,
      },
      {
        path: PATHS.SETTINGS.BILLING.RELATIVE,
        element: <ProtectedRoute component={BillingTeamContainer} />,
        children: [
          {
            index: true,
            element: <BillingList />,
          },
          {
            path: PATHS.SETTINGS.BILLING.RELATIVE + "/:billingId",
            element: <BillingTeamDetails />,
          },
        ],
      },
      {
        path: PATHS.SETTINGS.PROFILE.RELATIVE,
        element: <ProtectedRoute component={Profile} />,
      },
      {
        path: PATHS.SETTINGS.MY_PLAN.RELATIVE,
        element: <ProtectedRoute component={UserPlanDetails} />,
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
