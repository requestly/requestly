import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { StorageService } from "init";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getFormattedTimestamp } from "utils/DateTimeUtils";
import { TestReport } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { trackTestRuleReportGenerated } from "modules/analytics/events/features/ruleEditor";
import "./index.css";

interface TestReportsProps {
  scrollToTestRule: () => void;
}

export const TestReports: React.FC<TestReportsProps> = ({ scrollToTestRule }) => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [testReports, setTestReports] = useState(null);
  const [newReportId, setNewReportId] = useState(null);
  const [refreshTestReports, setRefreshTestReports] = useState(true);

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_TEST_RULE_REPORT_UPDATED,
      (message: { testReportId: string }) => {
        setRefreshTestReports(true);
        setNewReportId(message.testReportId);
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
      StorageService(appMode)
        .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.TEST_REPORTS)
        .then((data) => {
          if (data) {
            const newTestReport = data[newReportId];
            if (newTestReport) {
              trackTestRuleReportGenerated(currentlySelectedRuleData.ruleType, newTestReport.appliedStatus);
            }

            const reports = Object.values(data)
              .filter((report: TestReport) => report.ruleId === currentlySelectedRuleData.id)
              .sort((report1: TestReport, report2: TestReport) => report2.timestamp - report1.timestamp);

            if (reports.length) setTestReports(reports);
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
          <div className="test-this-rule-row-header test-this-rule-results-header text-bold subtitle">
            Previous results
          </div>
          <div className="test-this-rule-report-row-wrapper">
            {testReports.map((report: TestReport, index: number) => (
              <div
                className={`test-this-rule-report-row ${report.id === newReportId && "highlight-new-report"}`}
                key={index}
              >
                <div className="text-white text-bold">{report.url}</div>
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
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};
