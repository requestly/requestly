import React from "react";
import { ruleIcons } from "./ruleIcons";
import "./RuleIcon.css";

const RuleIcon = ({ ruleType }) => {
  return <span className="rule-type-icon">{ruleIcons[ruleType]}</span>;
};

export default RuleIcon;
