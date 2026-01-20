import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import {
  getSessionRecordingAttributes,
  getSessionRecordingEvents,
  getSessionRecordingMetaData,
  getTrimmedSessionData,
} from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import { compressEvents, getSessionEventsToSave } from "features/sessionBook/utils/sessionEvents";
import { trackDraftSessionSaved, trackDraftSessionSaveFailed } from "features/sessionBook/analytics";
import { toast } from "utils/Toast";
import { DebugInfo, SessionSaveMode } from "features/sessionBook/types";
import PATHS from "config/constants/sub/paths";
import { getAppFlavour } from "utils/AppUtils";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

export const useSaveDraftSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionAttributes = useSelector(getSessionRecordingAttributes);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const trimmedSessionData = useSelector(getTrimmedSessionData);

  const saveDraftSessionHandler = useCallback(
    async (recordingOptions: DebugInfo[], isOpenedInIframe: boolean, source: string) => {
      const sessionEventsToSave = trimmedSessionData?.events ?? sessionEvents;
      const attributes = {
        ...sessionAttributes,
        duration: trimmedSessionData?.duration ?? sessionAttributes?.duration,
      };
      const sessionMetadata = { ...sessionRecordingMetadata, sessionAttributes: attributes };

      const recordingOptionsToSave = getRecordingOptionsToSave(recordingOptions);
      const appFlavour = getAppFlavour();
      const clientSource =
        appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.REQUESTLY
          ? GLOBAL_CONSTANTS.CLIENT_SOURCE.REQUESTLY
          : GLOBAL_CONSTANTS.CLIENT_SOURCE.SESSIONBEAR;

      if (isOpenedInIframe) {
        window.parent.postMessage(
          {
            action: "draftSessionSaveClicked",
            source: clientSource,
            payload: {
              name: sessionRecordingMetadata?.name,
              description: sessionRecordingMetadata?.description,
              recordingOptions: recordingOptions,
            },
          },
          "*"
        );
      }

      const workspaceId = isOpenedInIframe ? searchParams.get("workspaceId") : activeWorkspaceId;

      return saveRecording(
        user?.details?.profile?.uid,
        workspaceId ?? null,
        sessionMetadata,
        compressEvents(getSessionEventsToSave(sessionEventsToSave, recordingOptionsToSave)),
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
              {
                action: "draftSessionSaved",
                source: clientSource,
                payload: { sessionId: response?.firestoreId },
              },
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
        dispatch(sessionRecordingActions.setTrimmedSessiondata(null));
      });
    },
    [
      appMode,
      activeWorkspaceId,
      dispatch,
      navigate,
      user,
      sessionEvents,
      sessionRecordingMetadata,
      searchParams,
      trimmedSessionData,
      sessionAttributes,
    ]
  );

  return {
    saveDraftSession: saveDraftSessionHandler,
  };
};
