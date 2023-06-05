import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { SessionsContainer } from "views/containers/SessionsContainer";
import SessionsHomeView from "views/features/sessions";
import { DraftSessionViewer, SavedSessionViewer } from "views/features/sessions/SessionViewer";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";

export const sessionsRoutes: RouteObject[] = [
  {
    path: PATHS.SESSIONS.INDEX,
    element: <SessionsContainer />,
    children: [
      {
        index: true,
        element: <SessionsHomeView />,
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
    ],
  },
];
