import React, { useCallback, useEffect, useState } from "react";
import { Row } from "antd";
import { EXTENSION_MESSAGES } from "../../../constants";
import { Rule } from "../../../types";
import RuleItem from "../common/RuleItem";
import { updateItemInCollection } from "../../utils";
import TabContentSection from "../common/TabContentSection";

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
          <RuleItem rule={rule} key={rule.id} onRuleUpdated={updateExecutedRule} tab="executed_rules" />
        ))}
      </ul>
    </TabContentSection>
  ) : (
    <Row align="middle" justify="center">
      <span className="empty-records-title">No rules executed in this tab.</span>
    </Row>
  );
};

export default ExecutedRules;
