import { saveRecording } from "backend/sessionRecording/saveRecording";
import { compressEvents, getSessionEventsToSave } from "../../../utils/sessionEvents";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { toast } from "utils/Toast";
import { trackDraftSessionSaveFailed, trackDraftSessionSaved } from "features/sessionBook/analytics";
import { SessionRecordingMetadata, SessionSaveMode } from "../../../types";
import { Dispatch } from "@reduxjs/toolkit";
import PATHS from "config/constants/sub/paths";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { NavigateFunction } from "react-router-dom";
import { CheckboxValueType } from "antd/lib/checkbox/Group";

export const generateDraftSessionTitle = (url: string) => {
  const hostname = new URL(url).hostname.split(".").slice(0, -1).join(".");
  const date = new Date();
  const month = date.toLocaleString("default", { month: "short" });
  const formattedDate = `${date.getDate()}${month}${date.getFullYear()}`;
  return `${hostname}@${formattedDate}`;
};

export const saveDraftSession = async (
  user: any,
  userAttributes: any,
  appMode: string,
  dispatch: Dispatch,
  navigate: NavigateFunction,
  workspaceId: string,
  sessionRecordingMetadata: SessionRecordingMetadata,
  sessionEvents: any,
  recordingOptions: CheckboxValueType[],
  source: string,
  isOpenedInIframe?: boolean
) => {
  const recordingOptionsToSave = getRecordingOptionsToSave(recordingOptions);

  if (isOpenedInIframe) {
    window.parent.postMessage({ action: "draftSessionSaveClicked", source: "requestly:client" }, "*");
  }

  return saveRecording(
    user?.details?.profile?.uid,
    workspaceId,
    sessionRecordingMetadata,
    compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave)),
    recordingOptionsToSave,
    source,
    null
  ).then((response) => {
    if (response?.success) {
      toast.success("Recording saved successfully");
      trackDraftSessionSaved({
        session_length: sessionRecordingMetadata?.sessionAttributes?.duration,
        options: recordingOptionsToSave,
        type: SessionSaveMode.ONLINE,
        source,
        recording_mode: sessionRecordingMetadata?.recordingMode,
      });

      if (isOpenedInIframe) {
        window.parent.postMessage(
          { action: "draftSessionSaved", source: "requestly:client", payload: { sessionId: response?.firestoreId } },
          "*"
        );
      } else {
        let path = "/" + PATHS.SESSIONS.RELATIVE + "/saved/" + response?.firestoreId;
        if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP)
          path = PATHS.SESSIONS.DESKTOP.SAVED_WEB_SESSION_VIEWER.ABSOLUTE + `/${response?.firestoreId}`;
        navigate(path, {
          state: { fromApp: true, viewAfterSave: true },
        });
      }
    } else {
      toast.error(response?.message);
      trackDraftSessionSaveFailed(response?.message);
    }
  });
};
