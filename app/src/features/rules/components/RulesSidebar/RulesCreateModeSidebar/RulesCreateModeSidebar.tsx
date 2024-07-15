import React from "react";
import { RuleSelectionList } from "features/rules/screens/rulesList/components/RulesList/components";
import BotIcon from "assets/icons/bot.svg?react";
import { RQButton } from "lib/design-system/components";
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

      <RuleSelectionList premiumIconSource="rule_sidebar" />
    </div>
  );
};
