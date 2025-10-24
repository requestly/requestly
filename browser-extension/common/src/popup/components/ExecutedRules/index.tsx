import React, { useCallback } from "react";
import { LINKS } from "../../../constants";
import { Rule } from "../../../types";
import RuleItem from "../common/RuleItem";
import { updateItemInCollection } from "../../utils";
import TabContentSection from "../common/TabContentSection";
import { PrimaryActionButton } from "../common/PrimaryActionButton";
import { EmptyPopupTab } from "../PopupTabs/EmptyPopupTab";

interface ExecutedRulesProps {
  executedRules: Rule[];
  setExecutedRules: React.Dispatch<React.SetStateAction<Rule[]>>;
}

const ExecutedRules: React.FC<ExecutedRulesProps> = ({ executedRules, setExecutedRules }) => {
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
