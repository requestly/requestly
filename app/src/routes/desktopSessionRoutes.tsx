import PATHS from "config/constants/sub/paths";
import { DraftSessionScreen } from "features/sessionBook/screens/DraftSessionScreen/DraftSessionScreen";
import { SessionsListScreenContainer } from "features/sessionBook/screens/SessionsListScreen/SessionsListScreenContainer";
import { Navigate, RouteObject } from "react-router-dom";
import { DesktopSessionsContainer } from "views/containers/DesktopSessionsContainer";
import { SavedSessionViewer } from "views/features/sessions/SessionViewer";
import NetworkSessionsIndexPage from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";

export const desktopSessionsRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.DESKTOP.INDEX,
    element: <DesktopSessionsContainer />,
    children: [
      {
        path: "",
        element: <Navigate to={PATHS.SESSIONS.DESKTOP.SAVED_LOGS.RELATIVE} />,
      },
      {
        index: true,
        path: PATHS.SESSIONS.DESKTOP.SAVED_LOGS.RELATIVE,
        element: <NetworkSessionsIndexPage />,
      },
      {
        path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE + "/imported",
        element: <DraftSessionScreen desktopMode={true} />,
      },
      {
        path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS_WRAPPER.RELATIVE,
        element: <SessionsListScreenContainer />,
      },
      {
        path: PATHS.SESSIONS.DESKTOP.SAVED_WEB_SESSION_VIEWER.ABSOLUTE + "/:id",
        element: <SavedSessionViewer />,
      },
      {
        path: PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE + "/:id",
        element: <NetworkSessionViewer />,
      },
      {
        path: PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE,
        element: <NetworkSessionViewer />,
      },
    ],
  },
];
