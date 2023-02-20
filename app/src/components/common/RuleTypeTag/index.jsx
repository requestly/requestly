import React from "react";
import { Tag } from "antd";
import APP_CONSTANTS from "config/constants";
import RuleIcon from "../RuleIcon";
import "./RuleTypeTag.css";

const RuleTypeTag = ({ ruleType, title }) => {
  return (
    <Tag className="rule-type-tag" icon={<RuleIcon ruleType={ruleType} />}>
      <span className="rule-type-tag-name">
        {title ?? APP_CONSTANTS.RULE_TYPES_CONFIG[ruleType]?.NAME}
      </span>
    </Tag>
  );
};

export default RuleTypeTag;
