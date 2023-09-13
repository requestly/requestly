import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getCurrentlySelectedRuleData, getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { Checkbox, Row, Typography } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { TestReports } from "./TestReports";
import { isValidUrl } from "utils/FormattingHelper";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { testRuleOnUrl } from "actions/ExtensionActions";
import { BsFillLightningChargeFill } from "@react-icons/all-files/bs/BsFillLightningChargeFill";
import { InfoCircleOutlined } from "@ant-design/icons";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "config/constants";
import LINKS from "config/constants/sub/links";
import { trackTestRuleClicked, trackTroubleshootClicked } from "modules/analytics/events/features/ruleEditor";
import "./index.css";

export const TestThisRuleRow: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const isNewRuleCreated = useMemo(() => state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE, [
    state?.source,
  ]);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const testThisRuleBoxRef = useRef(null);

  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);
  const [recordTestPage, setRecordTestPage] = useState<boolean>(true);

  const isRuleCurrentlyActive = useMemo(() => {
    return currentlySelectedRuleData.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
  }, [currentlySelectedRuleData.status]);

  const isTestRuleDisabled = useMemo(() => {
    return isCurrentlySelectedRuleHasUnsavedChanges || !isRuleCurrentlyActive;
  }, [isCurrentlySelectedRuleHasUnsavedChanges, isRuleCurrentlyActive]);

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
    if (error) {
      setError(null);
    }

    trackTestRuleClicked(currentlySelectedRuleData.ruleType, recordTestPage);
    setPageUrl(urlToTest);
    testRuleOnUrl({ url: urlToTest, ruleId: currentlySelectedRuleData.id, record: recordTestPage });
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

    if (!isRuleCurrentlyActive) {
      return (
        <div className="test-this-rule-message">
          <InfoCircleOutlined />
          <Typography.Text>Please enable the rule to test</Typography.Text>
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
    <div style={{ marginBottom: "2rem" }}>
      <div
        className={`test-this-rule-row-wrapper ${
          isCurrentlySelectedRuleHasUnsavedChanges
            ? "test-this-rule-warning"
            : isNewRuleCreated
            ? "test-this-rule-success"
            : !isRuleCurrentlyActive
            ? "test-this-rule-disabled"
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
                  disabled={isTestRuleDisabled}
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
                disabled={isTestRuleDisabled}
              >
                <BsFillLightningChargeFill className="start-test-rule-btn-icon" /> Test Rule
              </RQButton>
            </Row>
            <Row className="mt-8">
              <Checkbox checked={recordTestPage} onChange={(e) => setRecordTestPage(e.target.checked)}>
                Capture screen, console and network details for this test
              </Checkbox>
            </Row>
          </div>
          <TestReports scrollToTestRule={handleScrollToTestThisRule} />
        </div>
      </div>
      <div className="mt-8 text-gray">
        Rules not working as expected? Checkout our{" "}
        <a
          className="external-link"
          href={LINKS.REQUESTLY_EXTENSION_RULES_NOT_WORKING}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            trackTroubleshootClicked("test_this_rule");
          }}
        >
          troubleshooting guide
        </a>
        .
      </div>
    </div>
  );
};
