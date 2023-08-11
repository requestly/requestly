import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SessionsHomeView from "views/features/sessions";
import { DraftSessionViewer, SavedSessionViewer } from "views/features/sessions/SessionViewer";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";
import ConfigurationPage from "views/features/sessions/ConfigurationPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import SessionsSettingsPage from "views/features/sessions/SessionsSettingsPage";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

const isSessionsNewSettingsPageCompatible = isFeatureCompatible(FEATURES.SESSION_ONBOARDING);

export const sessionRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.INDEX,
    element: <SessionsHomeView />,
  },
  {
    path: PATHS.SESSIONS.SETTINGS.RELATIVE,
    element: (
      // @ts-ignore
      <ProtectedRoute component={isSessionsNewSettingsPageCompatible ? SessionsSettingsPage : ConfigurationPage} />
    ),
  },
  {
    path: PATHS.SESSIONS.DRAFT.RELATIVE + "/:tabId",
    element: <DraftSessionViewer />,
  },
  {
    path: PATHS.SESSIONS.SAVED.RELATIVE + "/:id",
    element: <SavedSessionViewer />,
  },
  {
    path: PATHS.SESSIONS.NETWORK.RELATIVE + "/:id",
    element: <NetworkSessionViewer />,
  },
  {
    /**
     * Avoids circular redirects
     */
    path: "/r" + PATHS.SESSIONS.SAVED.RELATIVE + "/:id",
    element: <Navigate to={window.location.pathname.replace("/r", "")} />,
  },
];
