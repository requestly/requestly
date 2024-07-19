import { saveRecording } from "backend/sessionRecording/saveRecording";
import { compressEvents, getRecordingOptionsToSave, getSessionEventsToSave } from "./sessionEventsUtils";
import { toast } from "utils/Toast";
import {
  trackDraftSessionSaveFailed,
  trackDraftSessionSaved,
} from "modules/analytics/events/features/sessionRecording";
import { SessionRecordingMetadata, SessionSaveMode } from "./types";
import { IncentivizeEvent, UserIncentiveEvent } from "features/incentivization/types";
import { Dispatch } from "@reduxjs/toolkit";
import { incentivizationActions } from "store/features/incentivization/slice";
import { IncentivizationModal } from "store/features/incentivization/types";
import { trackTestRuleSessionDraftSaved } from "modules/analytics/events/features/ruleEditor";
import { getTestReportById, saveTestReport } from "components/features/rules/TestThisRule";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
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

// TODO: FIX THIS WHEN REVAMPING SESSION VIEWER UI
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
  testRuleDraftSession: any,
  claimIncentiveRewards: (event: UserIncentiveEvent) => Promise<unknown>
) => {
  const isDraftSession =
    window.location.pathname.includes("draft") ||
    !!testRuleDraftSession ||
    appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP;

  const recordingOptionsToSave = getRecordingOptionsToSave(recordingOptions);

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

      testRuleDraftSession && trackTestRuleSessionDraftSaved(SessionSaveMode.ONLINE);
      if (testRuleDraftSession) {
        getTestReportById(appMode, testRuleDraftSession.testReportId).then((testReport) => {
          if (testReport) {
            testReport.sessionLink = getSessionRecordingSharedLink(response?.firestoreId);
            saveTestReport(appMode, testRuleDraftSession.testReportId, testReport).then(
              testRuleDraftSession.closeModal
            );
          }
        });
      } else {
        let path = "/" + PATHS.SESSIONS.INDEX + "/saved/" + response?.firestoreId;
        if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP)
          path = PATHS.SESSIONS.DESKTOP.SAVED_WEB_SESSION_VIEWER.ABSOLUTE + `/${response?.firestoreId}`;
        navigate(path, {
          replace: true,
          state: { fromApp: true, viewAfterSave: true },
        });
      }
    } else {
      toast.error(response?.message);
      trackDraftSessionSaveFailed(response?.message);
      // setIsSaving(false);
    }
  });
};
