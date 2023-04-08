import React, { useMemo } from 'react';
import { Button, Col, Row } from 'antd';
import PATHS from 'config/constants/sub/paths';
import { NavLink } from 'react-router-dom';
import { RuleType } from 'types/rules';
import { getRuleDetails } from '../utils';
import { trackRuleCreationWorkflowStartedEvent } from 'modules/analytics/events/common/rules';
import './ruleHeader.css';

interface RuleHeaderProps {
  selectedRuleType: RuleType;
}

const RuleHeader: React.FC<RuleHeaderProps> = ({ selectedRuleType }) => {
  const { icon, name, subtitle, header } = useMemo(() => getRuleDetails(selectedRuleType), [selectedRuleType]);

  const handleCreateRuleClick = (ruleType: RuleType) => {
    trackRuleCreationWorkflowStartedEvent(ruleType, 'screen');
  };

  return (
    <Row align="middle" className="rule-header" wrap={false}>
      <Col className="rule-header-icon" span={3}>
        {icon}
      </Col>
      <Col className="rule-header-name-container" span={18}>
        <Row>
          <div className="header">{name}</div>
        </Row>
        <Row className="text-gray line-clamp-2">{header?.description ?? subtitle}</Row>
      </Col>
      <Col span={3} className="ml-auto">
        <Row align="middle" justify="end">
          <NavLink
            replace
            to={`${PATHS.RULE_EDITOR.CREATE_RULE.ABSOLUTE}/${selectedRuleType}`}
            state={{ source: 'rule_selection' }}
          >
            <Button size="large" type="primary" onClick={() => handleCreateRuleClick(selectedRuleType)}>
              Create Rule
            </Button>
          </NavLink>
        </Row>
      </Col>
    </Row>
  );
};

export default RuleHeader;
