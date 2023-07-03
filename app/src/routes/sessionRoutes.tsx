import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SessionsHomeView from "views/features/sessions";
import { DraftSessionViewer, SavedSessionViewer } from "views/features/sessions/SessionViewer";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";
import ConfigurationPage from "views/features/sessions/ConfigurationPage";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import SessionsSettingsPage from "views/features/sessions/SessionsSettingsPage";

const isCompatible = true;

export const sessionRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.INDEX,
    element: <SessionsHomeView />,
  },
  {
    path: PATHS.SESSIONS.SETTINGS.RELATIVE,
    // @ts-ignore
    element: <ProtectedRoute component={isCompatible ? SessionsSettingsPage : ConfigurationPage} />,
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
];
