import PATHS from "config/constants/sub/paths";
import { Navigate, RouteObject } from "react-router-dom";
import { DesktopSessionsContainer } from "views/containers/DesktopSessionsContainer";
import { 
    DraftSessionViewer, 
    SavedSessionViewer 
} from "views/features/sessions/SessionViewer";
import NetworkSessionViewer from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";
import { DesktopSessionsIndexView } from "views/features/sessions/desktopSessions"; // todo: remove
// import { HarViewerIndex } from "views/features/sessions/desktopSessions/HarViewer";
// import { WebSessionViewer } from "views/features/sessions/desktopSessions/WebSessionLocalViewer";
import { WebSessionsWrapper } from "views/features/sessions/desktopSessions/WebSessionsWrapper";

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
                element: <DesktopSessionsIndexView />, // for now
            },
            // {
            //     path: PATHS.SESSIONS.DESKTOP.HAR_VIEWER.RELATIVE,
            //     element: <HarViewerIndex />,
            // },
            // {
            //     path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.RELATIVE,
            //     element: <WebSessionViewer />,
            // },
            {
                path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE + '/imported',
                element: <DraftSessionViewer desktopMode={true}/>,
            },
            {
                path: PATHS.SESSIONS.DESKTOP.WEB_SESSIONS_WRAPPER.RELATIVE, 
                element: <WebSessionsWrapper />,
            },
            {
                path: PATHS.SESSIONS.DESKTOP.SAVED_WEB_SESSION_VIEWER.ABSOLUTE + "/:id",
                element: <SavedSessionViewer />,
            },
            { // todo: remove
                path: PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE  + "/:id",
                element: <NetworkSessionViewer />,
            },
            {
                path: PATHS.SESSIONS.DESKTOP.NETWORK.ABSOLUTE,
                element: <NetworkSessionViewer />,
            },
        ],
    }
];