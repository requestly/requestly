import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { Row, Typography } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { isValidUrl } from "utils/FormattingHelper";
import { redirectToUrl } from "utils/RedirectionUtils";
import { BsFillLightningChargeFill } from "@react-icons/all-files/bs/BsFillLightningChargeFill";
import APP_CONSTANTS from "config/constants";
import "./index.css";

export const TestThisRuleRow: React.FC = () => {
  const location = useLocation();
  const { state } = location;
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const testThisRuleBoxRef = useRef(null);
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);

  const handleStartTestRule = () => {
    if (!pageUrl.length) {
      setError("Enter a page URL");
      return;
    }
    if (!isValidUrl(pageUrl)) {
      setError("Enter a valid page URL");
      return;
    }
    if (error) setError(null);
    redirectToUrl(pageUrl, true);
  };

  useEffect(() => {
    if (testThisRuleBoxRef.current && state?.source === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
      const scrollToChild = () => {
        const ruleBuilderBody = document.querySelector("#rule-builder-body");
        const parentRect = ruleBuilderBody.getBoundingClientRect();
        const childRect = testThisRuleBoxRef.current.getBoundingClientRect();
        const scrollPosition = childRect.top - parentRect.top + ruleBuilderBody.scrollTop;

        ruleBuilderBody.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      };

      const scrollTimeout = setTimeout(scrollToChild, 500);

      return () => clearTimeout(scrollTimeout);
    }
  }, [state?.source]);

  return (
    <div className="test-this-rule-row-wrapper" ref={testThisRuleBoxRef}>
      {isCurrentlySelectedRuleHasUnsavedChanges && (
        <Typography.Text>Please save your changes first to test this rule</Typography.Text>
      )}
      <div
        className={`test-this-rule-row w-full ${
          isCurrentlySelectedRuleHasUnsavedChanges && "disabled-test-this-rule-row"
        }`}
      >
        <div className="test-this-rule-row-header text-bold subtitle">Test this rule</div>
        <div className="test-this-rule-row-body">
          <Row>
            <div style={{ flex: 1 }}>
              <RQInput
                placeholder="Enter the URL you want to test"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                status={error ? "error" : ""}
              />
              <Typography.Text type="danger" className="caption">
                {error}
              </Typography.Text>
            </div>
            <RQButton type="primary" size="large" className="start-test-rule-btn" onClick={handleStartTestRule}>
              <BsFillLightningChargeFill className="start-test-rule-btn-icon" /> Test Rule
            </RQButton>
          </Row>
          {/* ADD CHECKBOX FOR SESSION REPLAY HERE IN V1 */}
        </div>
      </div>
    </div>
  );
};
