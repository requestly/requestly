import React, { useCallback, useState } from "react";
import { Col, Row } from "antd";
import RuleHeader from "./RuleHeader";
import RuleList from "./RuleList";
import RuleDetails from "./RuleDetails";
import { RuleType } from "types/rules";
import { trackRuleTypeSwitched } from "modules/analytics/events/common/rules";
import "./ruleSelection.css";

const RuleSelectionIndexPage: React.FC = () => {
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType>(
    RuleType.REDIRECT
  );

  const handleRuleClick = useCallback((ruleType: RuleType) => {
    trackRuleTypeSwitched(ruleType);
    setSelectedRuleType(ruleType);
  }, []);

  return (
    <Row>
      <Col span={8}>
        <RuleList
          selectedRuleType={selectedRuleType}
          handleRuleClick={handleRuleClick}
        />
      </Col>
      <Col span={16} className="rules-info-container">
        <RuleHeader selectedRuleType={selectedRuleType} />
        <RuleDetails selectedRuleType={selectedRuleType} />
      </Col>
    </Row>
  );
};

export default RuleSelectionIndexPage;
