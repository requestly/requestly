import React, { useEffect, useState } from "react";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";
import { Rule as RuleOld } from "types";
import { Rule } from "features/rules/types/rules";
import { useRulesModalsContext } from "features/rules/context/modals";

export const DuplicateRuleModalWrapper: React.FC = () => {
  const { setOpenDuplicateRecordModalAction } = useRulesModalsContext();

  const [isModalActive, setIdModalActive] = useState(false);
  const [ruleToDuplicate, setRuleToDuplicate] = useState<Rule | null>(null);

  useEffect(() => {
    const openModal = (rule: Rule) => {
      setRuleToDuplicate(rule);
      setIdModalActive(true);
    };

    setOpenDuplicateRecordModalAction(() => openModal);
  }, [setOpenDuplicateRecordModalAction]);

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
