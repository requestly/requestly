import React from "react";
import { RuleSelectionList } from "features/rules/screens/rulesList/components/RulesList/components";
import BotIcon from "assets/icons/bot.svg?react";
import { RQButton } from "lib/design-system/components";
import { trackRuleTypeSwitched } from "modules/analytics/events/common/rules";
import "./RulesCreateModeSidebar.scss";

export const RulesCreateModeSidebar: React.FC = () => {
  return (
    <div className="rules-create-mode-sidebar-container">
      <RQButton
        className="ask-ai-btn"
        onClick={() => {
          // trackAskAIClicked();
          // setIsRequestBotVisible(true);
        }}
      >
        <div className="ask-ai-btn-content">
          <BotIcon />
          Ask AI for the right rule
        </div>
      </RQButton>

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
