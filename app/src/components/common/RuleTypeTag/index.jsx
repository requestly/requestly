import React from "react";
import { Tag } from "antd";
import APP_CONSTANTS from "config/constants";
import RuleIcon from "../RuleIcon";
import "./RuleTypeTag.css";

const RuleTypeTag = ({ ruleType, title }) => {
  const ruleTitle = title ?? APP_CONSTANTS.RULE_TYPES_CONFIG[ruleType]?.NAME;

  return (
    <Tag title={ruleTitle} className="rule-type-tag" icon={<RuleIcon ruleType={ruleType} />}>
      <span className="rule-type-tag-name">{ruleTitle}</span>
    </Tag>
  );
};

export default RuleTypeTag;
