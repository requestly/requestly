import React from "react";
import { RuleSelectionList } from "features/rules/screens/rulesList/components/RulesList/components";
import "./RulesCreateModeSidebar.scss";

export const RulesCreateModeSidebar: React.FC = () => {
  return (
    <div className="rules-create-mode-sidebar-container">
      {/* TODO: add ai input */}
      <RuleSelectionList premiumIconSource="rule_sidebar" />
    </div>
  );
};
