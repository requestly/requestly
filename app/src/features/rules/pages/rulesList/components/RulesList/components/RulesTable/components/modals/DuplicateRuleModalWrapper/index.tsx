import React, { useEffect, useState } from "react";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";
import { Rule as RuleOld } from "types";
import { Rule } from "features/rules/types/rules";
import { useRulesContext } from "../../../../../context";

export const DuplicateRuleModalWrapper: React.FC = () => {
  const { setDuplicateRuleAction } = useRulesContext();

  const [isModalActive, setIdModalActive] = useState(false);
  const [ruleToDuplicate, setRuleToDuplicate] = useState<Rule | null>(null);

  useEffect(() => {
    const duplicateRule = (rule: Rule) => {
      setRuleToDuplicate(rule);
      setIdModalActive(true);
    };

    setDuplicateRuleAction(() => duplicateRule);
  }, [setDuplicateRuleAction]);

  const onClose = () => {
    setRuleToDuplicate(null);
    setIdModalActive(false);
  };

  return isModalActive ? (
    <DuplicateRuleModal
      close={onClose}
      onDuplicate={onClose}
      isOpen={isModalActive}
      rule={(ruleToDuplicate as unknown) as RuleOld}
      analyticEventSource="rules_list"
    />
  ) : null;
};
