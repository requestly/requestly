import { saveRecording } from "backend/sessionRecording/saveRecording";
import { compressEvents, getSessionEventsToSave } from "../../../utils/sessionEvents";
import { getRecordingOptionsToSave } from "features/sessionBook/utils/sessionFile";
import { toast } from "utils/Toast";
import { trackDraftSessionSaveFailed, trackDraftSessionSaved } from "features/sessionBook/analytics";
import { SessionRecordingMetadata, SessionSaveMode } from "../../../types";
import { IncentivizeEvent, UserIncentiveEvent } from "features/incentivization/types";
import { Dispatch } from "@reduxjs/toolkit";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import PATHS from "config/constants/sub/paths";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
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
  claimIncentiveRewards: (event: UserIncentiveEvent) => Promise<unknown>,
  isOpenedInIframe?: boolean
) => {
  const isDraftSession = window.location.pathname.includes("draft") || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

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
        // TEMP DELAY
        setTimeout(() => {
          window.parent.postMessage({ action: "draftSessionSaved", source: "requestly:client" }, "*");
        }, 4000);
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
