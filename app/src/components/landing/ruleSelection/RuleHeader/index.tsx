import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Row } from "antd";
import { RuleType } from "types/rules";
import { getRuleDetails } from "../utils";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import "./ruleHeader.css";
import { PremiumFeature } from "features/pricing";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";

interface RuleHeaderProps {
  selectedRuleType: RuleType;
}

const RuleHeader: React.FC<RuleHeaderProps> = ({ selectedRuleType }) => {
  const navigate = useNavigate();
  const { icon, name, subtitle, header } = useMemo(() => getRuleDetails(selectedRuleType), [selectedRuleType]);
  const { getFeatureLimitValue } = useFeatureLimiter();

  const featureName = `${selectedRuleType.toLowerCase()}_rule` as FeatureLimitType;
  const isPremiumRule = !getFeatureLimitValue(featureName);

  const handleCreateRuleClick = (ruleType: RuleType) => {
    trackRuleCreationWorkflowStartedEvent(ruleType, "screen");
    redirectToCreateNewRule(navigate, selectedRuleType, "rule_selection");
  };

  const premiumRule = (): FeatureLimitType => {
    switch (selectedRuleType) {
      case RuleType.RESPONSE:
        return FeatureLimitType.response_rule;
      case RuleType.REQUEST:
        return FeatureLimitType.request_rule;
      case RuleType.SCRIPT:
        return FeatureLimitType.script_rule;
    }
  };

  return (
    <Row align="middle" className="rule-header" wrap={false}>
      <Col className="rule-header-icon" span={3}>
        {icon}
      </Col>
      <Col className="rule-header-name-container" span={18}>
        <Row>
          <div className="header">
            {name}
            {isPremiumRule ? <PremiumIcon /> : null}
          </div>
        </Row>
        <Row className="text-gray line-clamp-2">{header?.description ?? subtitle}</Row>
      </Col>
      <Col span={3} className="ml-auto">
        <Row
          align="middle"
          justify="end"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isPremiumRule ? (
            <PremiumFeature
              onContinue={() => {
                trackRuleCreationWorkflowStartedEvent(selectedRuleType, "screen");
                redirectToCreateNewRule(navigate, selectedRuleType, "rule_selection");
              }}
              feature={premiumRule()}
            >
              <Button size="large" type="primary">
                Create Rule
              </Button>
            </PremiumFeature>
          ) : (
            <Button size="large" type="primary" onClick={() => handleCreateRuleClick(selectedRuleType)}>
              Create Rule
            </Button>
          )}
        </Row>
      </Col>
    </Row>
  );
};

export default RuleHeader;
