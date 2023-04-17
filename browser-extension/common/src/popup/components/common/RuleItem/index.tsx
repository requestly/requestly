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
  tab?: string;
  onRuleUpdated?: (rule: Rule) => void;
}

const RuleItem: React.FC<RuleItemProps> = ({
  rule,
  isChildren = false,
  isParentPinnedRecords = false,
  onRuleUpdated,
  tab,
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
      tab,
      type: rule.ruleType,
    });
  }, [rule, isRuleActive, handleUpdateRule]);

  const handleGroupActiveClick = useCallback(() => {
    updateGroup({ ...group, status: Status.ACTIVE });
  }, [group, updateGroup]);

  return (
    <li>
      <Row align="middle" className="record-item" wrap={false}>
        <Col span={isChildren ? 20 : 18} className="record-name-container">
          <Row wrap={false} align="middle" className={`rule-name-container ${isChildren ? "child-rule" : ""}`}>
            <Tooltip placement="topRight" title={(RULE_TITLES as any)[rule.ruleType.toUpperCase()]}>
              <span className="icon-wrapper rule-type-icons">{icons[rule.ruleType]}</span>
            </Tooltip>

            <RecordName name={rule.name}>
              <a target="_blank" className="record-name link" href={`${config.WEB_URL}/rules/editor/edit/${rule.id}`}>
                {rule.name}
              </a>
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

        <Col span={4} className="record-switch-container">
          <Popconfirm
            trigger="hover"
            placement="topRight"
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
            <Row wrap={false} align="middle" justify="center">
              <div>
                <span className={`record-status-text ${!isRuleActive ? "text-gray" : ""}`}>
                  {isRuleActive ? "On" : "Off"}
                </span>
                <Switch
                  className="record-switch"
                  checked={isRuleActive}
                  disabled={isGroupInactive}
                  onChange={handleToggleStatus}
                />
              </div>
            </Row>
          </Popconfirm>
        </Col>
      </Row>
    </li>
  );
};

export default React.memo(RuleItem);
