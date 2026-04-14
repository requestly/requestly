import React from "react";
import { RuleSelectionList } from "features/rules/screens/rulesList/components/RulesList/components";
import { trackRuleTypeSwitched } from "modules/analytics/events/common/rules";
import "./RulesCreateModeSidebar.scss";

export const RulesCreateModeSidebar: React.FC = () => {
  return (
    <div className="rules-create-mode-sidebar-container">
      <RuleSelectionList
        source="rule_sidebar"
        premiumIconSource="rule_sidebar"
        onRuleItemClick={(ruleType) => {
          trackRuleTypeSwitched(ruleType, "rule_sidebar");
        }}
      />
    </div>
  );
};
