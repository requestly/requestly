import React, { useCallback } from "react";
import { Col, Popconfirm, Row, Switch, Tooltip } from "antd";
import PinAction from "../PinAction";
import { Rule, Status } from "../../../../types";
import config from "../../../../config";
import { RULE_TITLES } from "../../../../constants";
import { useRecords } from "../../../contexts/RecordsContext";
import { icons } from "../../../ruleTypeIcons";
import RecordName from "../RecordName";
import "./ruleItem.css";
import { EVENT, sendEvent } from "../../../events";

interface RuleItemProps {
  rule: Rule;
  isChildren?: boolean;
  isParentPinnedRecords?: boolean;
  onRuleUpdated?: (rule: Rule) => void;
}

const RuleItem: React.FC<RuleItemProps> = ({
  rule,
  isChildren = false,
  isParentPinnedRecords = false,
  onRuleUpdated,
}) => {
  const { groups, updateRule, updateGroup } = useRecords();
  const group = groups[rule.groupId];
  const isGroupInactive = group?.status === Status.INACTIVE;
  const isRuleActive = rule.status === Status.ACTIVE;

  const handleUpdateRule = useCallback(
    (rule: Rule) => {
      updateRule(rule, isParentPinnedRecords);
      onRuleUpdated?.(rule);
    },
    [updateRule, onRuleUpdated]
  );

  const handleToggleStatus = useCallback(() => {
    const updatedRule = {
      ...rule,
      status: isRuleActive ? Status.INACTIVE : Status.ACTIVE,
    };

    handleUpdateRule(updatedRule);
    sendEvent(EVENT.RULE_TOGGLED, {
      type: rule.ruleType,
      status: isRuleActive ? Status.INACTIVE : Status.ACTIVE,
    });
  }, [rule, isRuleActive, handleUpdateRule]);

  const handleGroupActiveClick = useCallback(() => {
    updateGroup({ ...group, status: Status.ACTIVE });
    sendEvent(EVENT.GROUP_TOGGLED, { status: Status.ACTIVE });
  }, [group, updateGroup]);

  return (
    <li>
      <Row align="middle" className={`record-item ${isChildren ? "child-record" : ""}`} wrap={false}>
        <Col
          span={isChildren ? 21 : 19}
          className="record-name-container link"
          onClick={() => {
            sendEvent(EVENT.EXTENSION_RULE_CLICKED, { rule_type: rule.ruleType });
            window.open(`${config.WEB_URL}/rules/editor/edit/${rule.id}`, "_blank");
          }}
        >
          <Row wrap={false} align="middle" className="rule-name-container">
            <Tooltip
              placement="topRight"
              title={(RULE_TITLES as any)[rule.ruleType.toUpperCase()]}
              color="var(--neutrals-black)"
            >
              <span className="icon-wrapper rule-type-icons">{icons[rule.ruleType]}</span>
            </Tooltip>

            <RecordName name={rule.name}>
              <span className="rule-name">{rule.name}</span>
            </RecordName>
          </Row>
        </Col>

        {!isChildren && (
          <Col span={2} className="icon-container">
            <Row align="middle">
              <PinAction record={rule} updateRecord={handleUpdateRule} />
            </Row>
          </Col>
        )}

        <Col span={3} className="record-switch-container">
          <Popconfirm
            trigger="hover"
            placement="topRight"
            color="#000000"
            disabled={!isGroupInactive}
            title={
              <span>
                Please enable <b>{group?.name as string}</b> group to make the rule work.
              </span>
            }
            okText="Enable"
            cancelText="Cancel"
            cancelButtonProps={{ ghost: true, type: "text" }}
            onConfirm={handleGroupActiveClick}
          >
            <Switch
              checkedChildren="ON"
              unCheckedChildren="OFF"
              className="record-switch"
              checked={isRuleActive}
              disabled={isGroupInactive}
              onChange={handleToggleStatus}
            />
          </Popconfirm>
        </Col>
      </Row>
    </li>
  );
};

export default React.memo(RuleItem);
