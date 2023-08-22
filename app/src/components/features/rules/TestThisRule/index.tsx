import React from "react";
import { Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { BsFillLightningChargeFill } from "@react-icons/all-files/bs/BsFillLightningChargeFill";
import "./index.css";

export const TestThisRuleRow: React.FC = () => {
  return (
    <div className="test-this-rule-row w-full">
      <div className="test-this-rule-row-header text-bold subtitle">Test this rule</div>
      <div className="test-this-rule-row-body">
        <Row>
          <RQInput style={{ flex: 1 }} placeholder="Enter the URL you want to test" />
          <RQButton type="primary" size="large" className="start-test-rule-btn">
            <BsFillLightningChargeFill className="start-test-rule-btn-icon" /> Test Rule
          </RQButton>
        </Row>
        {/* ADD CHECKBOX FOR SESSION REPLAY HERE IN V1 */}
      </div>
    </div>
  );
};
