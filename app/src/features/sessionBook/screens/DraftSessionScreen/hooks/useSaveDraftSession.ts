import { useIncentiveActions } from "features/incentivization/hooks";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getAppMode, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getSessionRecordingEvents, getSessionRecordingMetaData } from "store/features/session-recording/selectors";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import { compressEvents, getSessionEventsToSave } from "features/sessionBook/utils/sessionEvents";
import { trackDraftSessionSaved, trackDraftSessionSaveFailed } from "features/sessionBook/analytics";
import { toast } from "utils/Toast";
import { DebugInfo, SessionSaveMode } from "features/sessionBook/types";
import { IncentivizeEvent } from "features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import PATHS from "config/constants/sub/paths";
import { getAppFlavour } from "utils/AppUtils";

export const useSaveDraftSession = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { claimIncentiveRewards } = useIncentiveActions();
  const sessionRecordingMetadata = useSelector(getSessionRecordingMetaData);
  const sessionEvents = useSelector(getSessionRecordingEvents);
  const [searchParams] = useState(new URLSearchParams(window.location.search));

  const saveDraftSessionHandler = useCallback(
    async (recordingOptions: DebugInfo[], isOpenedInIframe: boolean, source: string) => {
      const isDraftSession =
        window.location.pathname.includes("draft") || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

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

      const workspaceId = isOpenedInIframe ? searchParams.get("workspaceId") : currentlyActiveWorkspace?.id;

      return saveRecording(
        user?.details?.profile?.uid,
        workspaceId ?? null,
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

          if (isDraftSession) {
            claimIncentiveRewards({
              type: IncentivizeEvent.SESSION_RECORDED,
              metadata: { num_sessions: userAttributes?.num_sessions || 1 },
            })?.then((response: any) => {
              if (response.data?.success) {
                dispatch(
                  incentivizationActions.setUserMilestoneAndRewardDetails({
                    userMilestoneAndRewardDetails: response.data?.data,
                  })
                );

                dispatch(
                  incentivizationActions.toggleActiveModal({
                    modalName: IncentivizationModal.TASK_COMPLETED_MODAL,
                    newValue: true,
                    newProps: { event: IncentivizeEvent.SESSION_RECORDED },
                  })
                );
              }
            });
          }

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
      });
    },
    [
      appMode,
      claimIncentiveRewards,
      currentlyActiveWorkspace,
      dispatch,
      navigate,
      user,
      userAttributes,
      sessionEvents,
      sessionRecordingMetadata,
      searchParams,
    ]
  );

  return {
    saveDraftSession: saveDraftSessionHandler,
  };
};
