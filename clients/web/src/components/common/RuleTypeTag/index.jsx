import React from "react";
import APP_CONSTANTS from "config/constants";
import RuleIcon from "../RuleIcon";
import "./RuleTypeTag.css";

const RuleTypeTag = ({ ruleType, title = null }) => {
  const ruleTitle = title ?? APP_CONSTANTS.RULE_TYPES_CONFIG[ruleType]?.NAME;

  return (
    <div title={ruleTitle} className="rule-type-tag">
      <RuleIcon ruleType={ruleType} />
      <span className="rule-type-tag-name">{ruleTitle}</span>
    </div>
  );
};

export default RuleTypeTag;
