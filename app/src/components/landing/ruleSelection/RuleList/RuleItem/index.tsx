import React, { ReactElement } from "react";
import { Col, Row } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { RuleType } from "types/rules";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import "./ruleItem.css";

interface RuleItemProps {
  type: RuleType;
  name: string;
  subtitle: string;
  icon: ReactElement;
  selectedRuleType: RuleType;
  handleRuleClick: (type: RuleType) => void;
}

const RuleItem: React.FC<RuleItemProps> = ({ type, name, icon, subtitle, selectedRuleType, handleRuleClick }) => {
  const { getFeatureLimitValue } = useFeatureLimiter();

  const featureName = `${type.toLowerCase()}_rule` as FeatureLimitType;
  const isPremiumRule = !getFeatureLimitValue(featureName);

  return (
    <Row
      wrap={false}
      align="middle"
      className={`ruleItem ${type === selectedRuleType ? "ruleItem-active" : ""}`}
      onClick={() => handleRuleClick(type)}
    >
      <Col span={2}>
        <Row align="middle" justify="center" className="ruleItem-left-icon">
          {icon}
        </Row>
      </Col>
      <Col span={20} className="ruleItem-name-container">
        <Row className="ruleItem-title line-clamp">
          {name}
          {isPremiumRule ? <PremiumIcon featureType={featureName} source="rule_selection_screen" /> : null}
        </Row>
        <Row className="text-gray ruleItem-description line-clamp">{subtitle}</Row>
      </Col>
      <Col span={2}>
        <Row align="middle" justify="center" className="ruleItem-right-icon">
          <RightOutlined />
        </Row>
      </Col>
    </Row>
  );
};

export default RuleItem;
