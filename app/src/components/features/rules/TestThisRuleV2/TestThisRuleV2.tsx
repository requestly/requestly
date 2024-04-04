import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData, getUserAuthDetails } from "store/selectors";
import { Checkbox, Col, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { TestReportsTable } from "./components/TestReportsTable";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { isValidUrl } from "utils/FormattingHelper";
import { getTabSession, testRuleOnUrl } from "actions/ExtensionActions";
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
import { DebugInfo } from "views/features/sessions/SessionViewer/types";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
import { EmptyTestResultScreen } from "./components/EmptyTestResultScreen";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SOURCE } from "modules/analytics/events/common/constants";
import "./TestThisRuleV2.scss";

export const TestThisRuleV2 = () => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);
  const [doCaptureSession, setDoCaptureSession] = useState(true);
  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [newReportId, setNewReportId] = useState(null);
  const [isSessionSaving, setIsSessionSaving] = useState(false);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const { viewAsPanel } = useBottomSheetContext();

  const handleStartTestRule = useCallback(() => {
    if (!pageUrl.length) {
      setError("Enter a page URL");
      return;
    }
    const urlToTest = prefixUrlWithHttps(pageUrl);

    if (!isValidUrl(urlToTest)) {
      setError("Enter a valid page URL");
      return;
    }
    if (!user.loggedIn && doCaptureSession) {
      setError("You need to login to capture your test session");
      return;
    }

    if (error) {
      setError(null);
    }
    // trackTestRuleClicked(currentlySelectedRuleData.ruleType, recordTestPage);
    setPageUrl(urlToTest);
    testRuleOnUrl({ url: urlToTest, ruleId: currentlySelectedRuleData.id, record: doCaptureSession });
  }, [pageUrl, error, doCaptureSession, currentlySelectedRuleData, user.loggedIn]);

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
            SOURCE.TEST_THIS_RULE
          ).then((response) => {
            if (response.success) {
              // trackTestRuleSessionDraftSaved(SessionSaveMode.ONLINE);
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
        if (message.record) {
          handleSaveTestSession(parseInt(message.testPageTabId), message.testReportId);
        }
      }
    );
  }, [currentlySelectedRuleData.ruleType, handleSaveTestSession]);

  useEffect(() => {
    if (refreshTestReports) {
      getTestReportsByRuleId(appMode, currentlySelectedRuleData.id)
        .then((testReports: TestReport[]) => {
          if (testReports.length) {
            setTestReports(testReports);

            const newTestReport = testReports.find((report: TestReport) => report.id === newReportId);
            if (newTestReport) {
              //  trackTestRuleReportGenerated(currentlySelectedRuleData.ruleType, newTestReport.appliedStatus);
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
  }, [appMode, currentlySelectedRuleData.id, refreshTestReports, newReportId]);

  return (
    <Col className="test-this-rule-container">
      {error && (
        <div className="test-rule-error-message">
          <MdOutlineWarningAmber />
          <span>{error}</span>
        </div>
      )}
      <Row align="middle" gutter={[8, 8]}>
        <Col>
          <RQInput
            className="test-rule-input"
            placeholder="Enter the URL you want to test"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            onPressEnter={handleStartTestRule}
            style={{
              width: viewAsPanel ? "280px" : "388px",
            }}
          />
        </Col>
        <Col>
          <RQButton type="primary" className="test-rule-btn" icon={<MdOutlineScience />} onClick={handleStartTestRule}>
            Test Rule
          </RQButton>
        </Col>
      </Row>
      <Checkbox
        checked={doCaptureSession}
        onChange={(event) => setDoCaptureSession(event.target.checked)}
        className="test-rule-checkbox"
      >
        Save the test session with video, console & network logs
      </Checkbox>
      <div className="mt-16 test-results-header">Results</div>
      <Col className="mt-8 test-reports-container">
        {testReports?.length ? (
          <TestReportsTable testReports={testReports} newReportId={newReportId} isSessionSaving={isSessionSaving} />
        ) : (
          <EmptyTestResultScreen />
        )}
      </Col>
    </Col>
  );
};
