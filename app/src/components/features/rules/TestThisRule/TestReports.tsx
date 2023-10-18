import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { Tooltip } from "antd";
import { RQModal } from "lib/design-system/components";
import { DraftSessionViewer } from "views/features/sessions/SessionViewer";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { TestReport } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { trackTestRuleReportGenerated, trackTestRuleResultClicked } from "modules/analytics/events/features/ruleEditor";
import { getTestReportsByRuleId } from "./helpers";
import { ReactComponent as SessionIcon } from "assets/icons/session.svg";
import { DRAFT_SESSION_VIEWED_SOURCE } from "views/features/sessions/SessionViewer/constants";
import "./index.css";

interface TestReportsProps {
  scrollToTestRule: () => void;
}

export const TestReports: React.FC<TestReportsProps> = ({ scrollToTestRule }) => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  const [testReports, setTestReports] = useState<TestReport[]>(null);
  const [newReportId, setNewReportId] = useState(null);
  const [newTestPageTabId, setNewTestPageTabId] = useState<string>(null);
  const [appliedRuleStatus, setAppliedRuleStatus] = useState<boolean>(false);
  const [refreshTestReports, setRefreshTestReports] = useState(true);
  const [showDraftSessionModal, setShowDraftSessionModal] = useState<boolean>(false);
  const [highlightNewReport, setHighlightNewReport] = useState<boolean>(false);

  const closeDraftSessionModal = useCallback(() => {
    setRefreshTestReports(true);
    setShowDraftSessionModal(false);
    highlightReport();
  }, []);

  const highlightReport = () => {
    setHighlightNewReport(true);
    setTimeout(() => {
      setHighlightNewReport(false);
    }, 4500);
  };

  const testRuleDraftSessionDetails = useMemo(() => {
    return {
      closeModal: closeDraftSessionModal,
      draftSessionTabId: newTestPageTabId,
      testReportId: newReportId,
      appliedRuleStatus: appliedRuleStatus,
    };
  }, [appliedRuleStatus, closeDraftSessionModal, newReportId, newTestPageTabId]);

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string; testPageTabId: string; record: boolean; appliedStatus: boolean }) => {
        setRefreshTestReports(true);
        setNewReportId(message.testReportId);
        setNewTestPageTabId(message.testPageTabId);
        setShowDraftSessionModal(message.record);
        setAppliedRuleStatus(message.appliedStatus);
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
          highlightReport();
        });
    }
  }, [appMode, currentlySelectedRuleData.id, currentlySelectedRuleData.ruleType, newReportId, refreshTestReports]);

  return (
    <>
      {testReports && (
        <>
          {newTestPageTabId && showDraftSessionModal && (
            <RQModal
              maskClosable={false}
              open={showDraftSessionModal}
              onCancel={closeDraftSessionModal}
              className="draft-session-modal"
              width={"90vw"}
              keyboard={false}
              closable={false}
            >
              <DraftSessionViewer
                testRuleDraftSession={testRuleDraftSessionDetails}
                source={DRAFT_SESSION_VIEWED_SOURCE.TEST_THIS_RULE}
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
                <div className="text-white text-bold fit-text-content">
                  <Tooltip title={report.url} destroyTooltipOnHide>
                    {report.url}
                  </Tooltip>
                </div>
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
                      <SessionIcon />{" "}
                      <Link onClick={trackTestRuleResultClicked} to={report.sessionLink}>
                        View session recording
                      </Link>
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
