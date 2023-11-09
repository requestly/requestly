import React, { useCallback, useEffect, useState } from "react";
import { EXTENSION_MESSAGES, LINKS } from "../../../constants";
import { Rule } from "../../../types";
import RuleItem from "../common/RuleItem";
import { updateItemInCollection } from "../../utils";
import TabContentSection from "../common/TabContentSection";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { EmptyPopupTab } from "../PopupTabs/EmptyPopupTab";

interface ExecutedRulesProps {
  setExecutedRulesCount: (count: number) => void;
}

const ExecutedRules: React.FC<ExecutedRulesProps> = ({ setExecutedRulesCount }) => {
  const [executedRules, setExecutedRules] = useState<Rule[]>([]);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, ([activeTab]) => {
      chrome.runtime.sendMessage(
        {
          tabId: activeTab.id,
          action: EXTENSION_MESSAGES.GET_EXECUTED_RULES,
        },
        (rules) => {
          setExecutedRules(rules);
          setExecutedRulesCount(rules.length);
        }
      );
    });
  }, []);

  const updateExecutedRule = useCallback((updatedRule: Rule) => {
    setExecutedRules((executedRules) => updateItemInCollection<Rule>(executedRules, updatedRule));
  }, []);

  return executedRules.length > 0 ? (
    <TabContentSection heading="Rules executed in this tab:">
      <ul className="record-list">
        {executedRules.map((rule) => (
          <RuleItem rule={rule} key={rule.id} onRuleUpdated={updateExecutedRule} />
        ))}
      </ul>
    </TabContentSection>
  ) : (
    <EmptyPopupTab
      title="No rules executed for this tab!"
      description={
        <>
          Your executed rules will appear here.
          <br /> If you encounter any issues, check our troubleshooting guide.
        </>
      }
      actionButton={
        <PrimaryActionButton
          size="small"
          onClick={() => window.open(LINKS.REQUESTLY_EXTENSION_TROUBLESHOOTING, "_blank")}
        >
          Read troubleshooting guide
        </PrimaryActionButton>
      }
    />
  );
};

export default ExecutedRules;
