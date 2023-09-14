import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { TestReport } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { trackTestRuleReportGenerated } from "modules/analytics/events/features/ruleEditor";
import "./index.css";
import { RQModal } from "lib/design-system/components";
import { DraftSessionViewer } from "views/features/sessions/SessionViewer";
import { getTestReportsByRuleId } from "./helpers";
import { Link } from "react-router-dom";
import { ReactComponent as SessionIcon } from "assets/icons/session.svg";

interface TestReportsProps {
  scrollToTestRule: () => void;
}

export const TestReports: React.FC<TestReportsProps> = ({ scrollToTestRule }) => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [newReportId, setNewReportId] = useState(null);
  const [newTestPageTabId, setNewTestPageTabId] = useState<string>(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [draftSessionModal, setDraftSessionModal] = useState<boolean>(false);
  const [highlightNewReport, setHighlightNewReport] = useState<boolean>(false);

  const closeDraftSessionModal = () => {
    setRefreshTestReports(true);
    setDraftSessionModal(false);
    hightlightReport();
  };

  const hightlightReport = () => {
    setHighlightNewReport(true);
    setTimeout(() => {
      setHighlightNewReport(false);
    }, 4500);
  };

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string; testPageTabId: string; record: boolean }) => {
        setRefreshTestReports(true);
        setNewReportId(message.testReportId);
        setNewTestPageTabId(message.testPageTabId);
        setDraftSessionModal(message.record);
      }
    );
  }, [currentlySelectedRuleData.ruleType]);

  useEffect(() => {
    if (newReportId) {
      const scrollTimeout = setTimeout(scrollToTestRule, 500);

      return () => clearTimeout(scrollTimeout);
    }
  }, [newReportId, scrollToTestRule]);

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
        .finally(() => {
          setRefreshTestReports(false);
        });
    }
  }, [appMode, currentlySelectedRuleData.id, currentlySelectedRuleData.ruleType, newReportId, refreshTestReports]);

  return (
    <>
      {testReports && (
        <>
          {newTestPageTabId && (
            <RQModal
              maskClosable={false}
              open={draftSessionModal}
              onCancel={closeDraftSessionModal}
              className="draft-session-modal"
            >
              <DraftSessionViewer
                testRuleDraftSession={{
                  closeModal: closeDraftSessionModal,
                  draftSessionTabId: newTestPageTabId,
                  testReportId: newReportId,
                }}
              />
            </RQModal>
          )}
          <div className="test-this-rule-row-header test-this-rule-results-header text-bold subtitle">
            Previous results
          </div>
          <div className="test-this-rule-report-row-wrapper">
            {testReports.map((report: TestReport, index: number) => (
              <div
                className={`test-this-rule-report-row ${
                  report.id === newReportId && highlightNewReport ? "highlight-new-report" : ""
                }`}
                key={index}
              >
                <div className="text-white text-bold test-this-rule-report-url">{report.url}</div>
                <div className="text-gray">{getFormattedTimestamp(report.timestamp)}</div>
                <div className="text-gray test-this-rule-report-status">
                  {report.appliedStatus ? (
                    <>
                      <CheckOutlined style={{ color: "var(--success" }} /> Rule executed
                    </>
                  ) : (
                    <>
                      <CloseOutlined style={{ color: "var(--danger" }} /> Failed
                    </>
                  )}
                </div>
                <div className="test-this-rule-report-session-link">
                  {report.sessionLink ? (
                    <>
                      <SessionIcon /> <Link to={report.sessionLink}>View session recording</Link>
                    </>
                  ) : (
                    "Session not saved"
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
