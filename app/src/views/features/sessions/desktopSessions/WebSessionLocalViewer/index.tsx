import { FileDropAndView } from "components/mode-specific/desktop/FileDropAndView";
import { useDispatch } from "react-redux";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { decompressEvents } from "../../SessionViewer/sessionEventsUtils";
// import { DraftSessionViewer } from "../../SessionViewer";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { joinPaths } from "utils/PathUtils";
import PATHS from "config/constants/sub/paths";

const WebSessionLocalViewer: React.FC<{data: any}> = (props) => {
    console.log('data', props.data)
    const parsedData = useMemo(() => {
        try {
            return JSON.parse(props.data).data  ;
        } catch (e) {
            return null;
        }
    }, [props.data]);
    const dispatch = useDispatch();
    /* redundant copy of actions in appmode initializer */
    // opening recording inside draft view
    dispatch(sessionRecordingActions.setSessionRecordingMetadata(parsedData?.metadata));
    const recordedSessionEvents = decompressEvents(parsedData?.events);
    dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
    const path = joinPaths(PATHS.SESSIONS.DESKTOP.INDEX, PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE + '/imported')
    console.log('path', path)
    return parsedData ? <Navigate to={PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE + '/imported'} /> : null;
}

export const WebSessionViewer: React.FC = () => {
    return <FileDropAndView 
        FilePreviewComponent={WebSessionLocalViewer}
        category='web-session'
    />
}