import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { StorageService } from "init";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { TestReport } from "./types";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./index.css";

export const TestReports: React.FC = () => {
  const appMode = useSelector(getAppMode);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [testReports, setTestReports] = useState(null);

  const getFormattedReportCreatedTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);

    const day = date.getDate();
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
    const year = date.getFullYear();

    const hours = date.getHours() % 12 || 12;
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const minutes = date.getMinutes();

    const formattedDate = `${day} ${month} ${year} - ${hours}:${minutes < 10 ? "0" : ""}${minutes}${ampm}`;
    return formattedDate;
  }, []);

  useEffect(() => {
    StorageService(appMode)
      .getRecord(GLOBAL_CONSTANTS.STORAGE_KEYS.TEST_REPORTS)
      .then((data) => {
        if (data) {
          const reports = Object.values(data).filter(
            (report: TestReport) => report.ruleId === currentlySelectedRuleData.id
          );
          if (reports.length) setTestReports(reports);
        }
      });
  }, [appMode, currentlySelectedRuleData.id]);

  return (
    <>
      {testReports && (
        <>
          <div className="test-this-rule-row-header test-this-rule-results-header text-bold subtitle">
            Previous results
          </div>
          <div className="test-this-rule-report-row-wrapper">
            {testReports.map((report: TestReport, index: number) => (
              <div className="test-this-rule-report-row" key={index}>
                <div className="text-white text-bold">{report.url}</div>
                <div className="text-gray">{getFormattedReportCreatedTime(report.timestamp)}</div>
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
