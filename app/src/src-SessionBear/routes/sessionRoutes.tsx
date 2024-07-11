import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import SessionsHomeView from "views/features/sessions";
import { DraftSessionViewer, SavedSessionViewer } from "views/features/sessions/SessionViewer";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";

export const sessionRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.INDEX,
    element: <SessionsHomeView />,
  },
  {
    path: PATHS.SESSIONS.SETTINGS.RELATIVE,
    element: <Navigate to={PATHS.SETTINGS.SESSION_BOOK.RELATIVE} replace />,
  },
  {
    path: PATHS.SESSIONS.DRAFT.RELATIVE,
    element: <DraftSessionViewer />,
  },
  {
    path: PATHS.SESSIONS.SAVED.RELATIVE + "/:id",
    element: <SavedSessionViewer />,
  },
  {
    // path: PATHS.SESSIONS.NETWORK.RELATIVE + "/:id",
    path: PATHS.NETWORK_LOGS.VIEWER.RELATIVE + "/:id",
    element: <NetworkSessionViewer />,
  },
  {
    // path: PATHS.SESSIONS.NETWORK.RELATIVE + "/:id", // todo
    path: PATHS.NETWORK_LOGS.HAR.INDEX,
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
