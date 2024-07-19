import { Navigate, RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";
import { SessionsListScreenContainer } from "./screens/SessionsListScreen/SessionsListScreenContainer";
import SessionsFeatureContainer from "./container";
import { DraftSessionScreen, SavedSessionScreen } from "features/sessionBook";

export const sessionRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.INDEX,
    element: <SessionsFeatureContainer />,
    children: [
      {
        index: true,
        element: <SessionsListScreenContainer />,
      },
      {
        path: PATHS.SESSIONS.DRAFT.INDEX + "/:tabId",
        element: <DraftSessionScreen />,
      },
      {
        path: PATHS.SESSIONS.SAVED.INDEX + "/:id",
        element: <SavedSessionScreen />,
      },
    ],
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
    path: "r/" + PATHS.SESSIONS.SAVED.RELATIVE + "/:id",
    element: <Navigate to={window.location.pathname.replace("/r", "")} />,
  },
];
