import React, { useMemo } from "react";
import { Row, Col } from "antd";
import DemoVideos from "./DemoVideos";
import { RuleType } from "types/rules";
import { getRuleDetails } from "../utils";
import "./ruleDetails.css";

interface RuleDetailsProps {
  selectedRuleType: RuleType;
}

const RuleDetails: React.FC<RuleDetailsProps> = ({ selectedRuleType }) => {
  const { description } = useMemo(() => getRuleDetails(selectedRuleType), [
    selectedRuleType,
  ]);

  return (
    <div className="rule-details-container">
      <Row className="rule-details-description-container">
        <Col span={24}>
          <div className="title text-bold rule-details-description-title">
            Description
          </div>
          <div
            className="text-gray rule-details-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Col>
      </Row>

      <DemoVideos selectedRuleType={selectedRuleType} />
    </div>
  );
};

export default RuleDetails;
