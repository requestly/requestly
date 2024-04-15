import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData, getUserAuthDetails } from "store/selectors";
import { Col } from "antd";
import { TestReportsTable } from "./components/TestReportsTable";
import { getTabSession } from "actions/ExtensionActions";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { TestReport } from "./types";
import { deleteTestReport, getTestReportById, getTestReportsByRuleId, saveTestReport } from "./helpers";
import { generateDraftSessionTitle } from "views/features/sessions/SessionViewer/utils";
import { saveRecording } from "backend/sessionRecording/saveRecording";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  compressEvents,
  getRecordingOptionsToSave,
  getSessionEventsToSave,
} from "views/features/sessions/SessionViewer/sessionEventsUtils";
import { DebugInfo, SessionSaveMode } from "views/features/sessions/SessionViewer/types";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
import { EmptyTestResultScreen } from "./components/EmptyTestResultScreen";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SOURCE } from "modules/analytics/events/common/constants";
import { trackTestRuleReportDeleted, trackTestRuleReportGenerated, trackTestRuleSessionDraftSaved } from "./analytics";
import { TestRuleHeader } from "./components/TestRuleHeader";
import "./TestThisRule.scss";

export const TestThisRule = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const { sheetPlacement, isBottomSheetOpen, toggleBottomSheet } = useBottomSheetContext();

  const fetchAndUpdateTestReports = useCallback(
    (testSessionBeingSaved?: string) => {
      getTestReportsByRuleId(appMode, currentlySelectedRuleData?.id)
        .then((testReports: TestReport[]) => {
          const reports = testReports;
          if (testSessionBeingSaved) {
            const index = reports.findIndex((report) => report.id === testSessionBeingSaved);
            if (index !== -1) {
              reports[index].isSessionSaving = true;
            }
          }
          setTestReports(reports);
        })
        .catch((error) => {
          Logger.log(error);
        });
    },
    [appMode, currentlySelectedRuleData?.id]
  );

  const handleSaveTestSession = useCallback(
    (tabId: number, reportId: string) => {
      getTabSession(tabId)
        .then((tabSession) => {
          if (!tabSession) return;
          const sessionMetadata = {
            sessionAttributes: tabSession.attributes,
            name: generateDraftSessionTitle(tabSession.attributes?.url),
            recordingMode: tabSession.recordingMode || null,
          };
          const sessionEvents = tabSession.events;

          const recordingOptionsToSave = getRecordingOptionsToSave([
            DebugInfo.INCLUDE_CONSOLE_LOGS,
            DebugInfo.INCLUDE_NETWORK_LOGS,
          ]);

          saveRecording(
            user.details?.profile?.uid,
            workspace?.id,
            sessionMetadata,
            compressEvents(getSessionEventsToSave(sessionEvents, recordingOptionsToSave)),
            recordingOptionsToSave,
            SOURCE.TEST_THIS_RULE,
            true
          ).then((response) => {
            if (response.success) {
              trackTestRuleSessionDraftSaved(SessionSaveMode.ONLINE);
              getTestReportById(appMode, reportId).then((testReport) => {
                if (testReport) {
                  testReport.sessionLink = getSessionRecordingSharedLink(response?.firestoreId);
                  saveTestReport(appMode, reportId, testReport).then(() => {
                    fetchAndUpdateTestReports();
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          Logger.log(error);
          toast.error("Error saving test session");
        });
    },
    [appMode, user.details?.profile?.uid, workspace?.id, fetchAndUpdateTestReports]
  );

  const handleTestReportDelete = useCallback(
    (reportId: string) => {
      deleteTestReport(appMode, reportId)
        .then(() => {
          toast.success("Test deleted successfully");
          trackTestRuleReportDeleted(currentlySelectedRuleData.ruleType);
          fetchAndUpdateTestReports();
        })
        .catch((error) => {
          Logger.log(error);
        });
    },
    [appMode, currentlySelectedRuleData.ruleType, fetchAndUpdateTestReports]
  );

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string; testPageTabId: string; record: boolean; appliedStatus: boolean }) => {
        fetchAndUpdateTestReports(message.testReportId);
        trackTestRuleReportGenerated(currentlySelectedRuleData.ruleType, message.appliedStatus);
        if (sheetPlacement === BottomSheetPlacement.BOTTOM) {
          toggleBottomSheet();
        }
        if (message.record) {
          handleSaveTestSession(parseInt(message.testPageTabId), message.testReportId);
        }
      }
    );
  }, [
    currentlySelectedRuleData.ruleType,
    handleSaveTestSession,
    fetchAndUpdateTestReports,
    isBottomSheetOpen,
    toggleBottomSheet,
    sheetPlacement,
  ]);

  useEffect(() => {
    fetchAndUpdateTestReports();
  }, [fetchAndUpdateTestReports]);

  return (
    <Col className="test-this-rule-container">
      <TestRuleHeader />
      <div className="mt-16 test-results-header">Results</div>
      <Col className="mt-8 test-reports-container">
        {testReports?.length ? (
          <TestReportsTable testReports={testReports} deleteReport={handleTestReportDelete} />
        ) : (
          <EmptyTestResultScreen />
        )}
      </Col>
    </Col>
  );
};
