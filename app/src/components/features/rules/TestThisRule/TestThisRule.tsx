import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData, getUserAuthDetails } from "store/selectors";
import { Col } from "antd";
import { TestReportsTable } from "./components/TestReportsTable";
import { getTabSession } from "actions/ExtensionActions";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { TestReport } from "./types";
import { getTestReportById, getTestReportsByRuleId, saveTestReport } from "./helpers";
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
import APP_CONSTANTS from "config/constants";
import { trackTestRuleReportGenerated, trackTestRuleSessionDraftSaved } from "./analytics";
import "./TestThisRule.scss";
import { TestRuleHeader } from "./components/TestRuleHeader";

export const TestThisRule = () => {
  const location = useLocation();
  const { state } = location;
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [newReportId, setNewReportId] = useState(null);
  const [isSessionSaving, setIsSessionSaving] = useState(false);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isNewRuleCreated = useRef(state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE);

  const { viewAsSidePanel, isBottomSheetOpen, toggleBottomSheet } = useBottomSheetContext();

  const handleSaveTestSession = useCallback(
    (tabId: number, reportId: string) => {
      setIsSessionSaving(true);
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
                    setRefreshTestReports(true);
                    setIsSessionSaving(false);
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          Logger.log(error);
          setIsSessionSaving(false);
          toast.error("Error saving test session");
        });
    },
    [appMode, user.details?.profile?.uid, workspace?.id, setRefreshTestReports, setIsSessionSaving]
  );

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string; testPageTabId: string; record: boolean; appliedStatus: boolean }) => {
        setRefreshTestReports(true);
        setNewReportId(message.testReportId);
        if (!viewAsSidePanel && !isBottomSheetOpen) {
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
    isBottomSheetOpen,
    toggleBottomSheet,
    viewAsSidePanel,
  ]);

  useEffect(() => {
    if (refreshTestReports) {
      getTestReportsByRuleId(appMode, currentlySelectedRuleData.id)
        .then((testReports: TestReport[]) => {
          if (testReports.length) {
            setTestReports(testReports);

            const newTestReport = testReports.find((report: TestReport) => report.id === newReportId);
            if (newTestReport) {
              trackTestRuleReportGenerated(currentlySelectedRuleData.ruleType, newTestReport.appliedStatus);
            }
          }
        })
        .catch((error) => {
          Logger.log(error);
        })
        .finally(() => {
          setRefreshTestReports(false);
        });
    }
  }, [appMode, currentlySelectedRuleData.id, refreshTestReports, newReportId, currentlySelectedRuleData.ruleType]);

  useEffect(() => {
    // Open the bottom sheet when a new rule is created
    if (isNewRuleCreated.current && !isBottomSheetOpen) {
      toggleBottomSheet();
      isNewRuleCreated.current = false;
    }
  }, [isBottomSheetOpen, toggleBottomSheet]);

  return (
    <Col className="test-this-rule-container">
      <TestRuleHeader />
      <div className="mt-16 test-results-header">Results</div>
      <Col className="mt-8 test-reports-container">
        {testReports?.length ? (
          <TestReportsTable
            testReports={testReports}
            newReportId={newReportId}
            isSessionSaving={isSessionSaving}
            refreshTestReports={() => setRefreshTestReports(true)}
          />
        ) : (
          <EmptyTestResultScreen />
        )}
      </Col>
    </Col>
  );
};
