import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getCurrentlySelectedRuleData, getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { Row, Typography } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { TestReports } from "./TestReports";
import { isValidUrl } from "utils/FormattingHelper";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { testRuleOnUrl } from "actions/ExtensionActions";
import { BsFillLightningChargeFill } from "@react-icons/all-files/bs/BsFillLightningChargeFill";
import { InfoCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import "./index.css";

export const TestThisRuleRow: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const isNewRuleCreated = useMemo(() => state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE, [
    state?.source,
  ]);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const ruleId = useSelector(getCurrentlySelectedRuleData).id;
  const testThisRuleBoxRef = useRef(null);
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);

  const handleStartTestRule = () => {
    if (!pageUrl.length) {
      setError("Enter a page URL");
      return;
    }
    const urlToTest = prefixUrlWithHttps(pageUrl);

    if (!isValidUrl(urlToTest)) {
      setError("Enter a valid page URL");
      return;
    }
    if (error) setError(null);
    setPageUrl(urlToTest);
    testRuleOnUrl(urlToTest, ruleId);
  };

  const FeedbackMessage = () => {
    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      return (
        <div className="test-this-rule-message">
          <InfoCircleOutlined />
          <Typography.Text>Please save your changes first to test this rule</Typography.Text>
        </div>
      );
    }

    if (isNewRuleCreated) {
      return (
        <div className="test-this-rule-message">
          <BsFillLightningChargeFill /> <Typography.Text>Your new rule is created and ready to use!</Typography.Text>
        </div>
      );
    }
  };

  const handleScrollToTestThisRule = useCallback(() => {
    if (testThisRuleBoxRef.current) {
      const ruleBuilderBody = document.querySelector("#rule-builder-body");
      const parentRect = ruleBuilderBody.getBoundingClientRect();
      const childRect = testThisRuleBoxRef.current.getBoundingClientRect();
      const scrollPosition = childRect.top - parentRect.top + ruleBuilderBody.scrollTop;

      ruleBuilderBody.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (testThisRuleBoxRef.current && isNewRuleCreated) {
      const scrollTimeout = setTimeout(handleScrollToTestThisRule, 500);

      return () => clearTimeout(scrollTimeout);
    }
  }, [isNewRuleCreated, handleScrollToTestThisRule]);

  return (
    <div
      className={`test-this-rule-row-wrapper ${
        isCurrentlySelectedRuleHasUnsavedChanges
          ? "test-this-rule-warning"
          : isNewRuleCreated
          ? "test-this-rule-success"
          : null
      }`}
      ref={testThisRuleBoxRef}
    >
      <FeedbackMessage />
      <div className="test-this-rule-row w-full">
        <div className="test-this-rule-row-header text-bold subtitle">Test this rule</div>
        <div className="test-this-rule-row-body">
          <Row>
            <div style={{ flex: 1 }}>
              <RQInput
                placeholder="Enter the URL you want to test"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                onPressEnter={handleStartTestRule}
                status={error ? "error" : ""}
                disabled={isCurrentlySelectedRuleHasUnsavedChanges}
              />
              <Typography.Text type="danger" className="caption">
                {error}
              </Typography.Text>
            </div>
            <RQButton
              type="primary"
              size="large"
              className="start-test-rule-btn"
              onClick={handleStartTestRule}
              disabled={isCurrentlySelectedRuleHasUnsavedChanges}
            >
              <BsFillLightningChargeFill className="start-test-rule-btn-icon" /> Test Rule
            </RQButton>
          </Row>
          {/* ADD CHECKBOX FOR SESSION REPLAY HERE IN V1 */}
        </div>
        <TestReports scrollToTestRule={handleScrollToTestThisRule} />
      </div>
    </div>
  );
};
