import React from "react";
import { CheckOutlined } from "@ant-design/icons";
import "./index.css";

export const TestReports: React.FC = () => {
  return (
    <>
      <div className="test-this-rule-row-header test-this-rule-results-header text-bold subtitle">Previous results</div>
      <div className="test-this-rule-report-row">
        <div className="text-white text-bold">mail.google.com</div>
        <div className="text-gray">16 July 2023- 11:40AM</div>
        <div className="text-gray test-this-rule-report-status">
          <CheckOutlined /> Rule executed
        </div>
      </div>
    </>
  );
};
