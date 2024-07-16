import { FilePickerModalBtn } from "components/mode-specific/desktop/DesktopFilePicker";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/Toast";
import { decompressEvents } from "../../../../../../../../views/features/sessions/SessionViewer/sessionEventsUtils";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import PATHS from "config/constants/sub/paths";
import { SessionRecordingMetadata } from "../../../../../../../../views/features/sessions/SessionViewer/types";

export const ImportWebSessionModalButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOnFileParsed = useCallback(
    (fileContents: string, fileName: string, filePath: string) => {
      try {
        const fileData = JSON.parse(fileContents);
        console.log("filename", fileName);
        console.log("filepath", filePath);
        console.log("fileData", fileData);
        const recordedSessionEvents = decompressEvents(fileData?.data?.events);
        const sessionMetadata = fileData?.data?.metadata as SessionRecordingMetadata;
        dispatch(sessionRecordingActions.setEvents(recordedSessionEvents));
        dispatch(
          sessionRecordingActions.setSessionRecordingMetadata({
            ...sessionMetadata,
            name: fileName,
            filePath: filePath,
          })
        );

        navigate(PATHS.SESSIONS.DESKTOP.WEB_SESSIONS.ABSOLUTE + "/imported");
      } catch (e) {
        console.error(e);
        toast.error("Error parsing file");
      }
    },
    [dispatch, navigate]
  );
  return (
    <FilePickerModalBtn
      category="web-session"
      btnText="Open Downloaded Session"
      modalTitle="Import .RQLY File"
      dropMessage="Import .RQLY File"
      onFileParsed={handleOnFileParsed}
    />
  );
};
