import React, { useEffect, useState } from "react";
import ChangeRuleGroupModal from "components/features/rules/ChangeRuleGroupModal";
import { Rule } from "@requestly/shared/types/entities/rules";
import { useRulesModalsContext } from "features/rules/context/modals";

interface Props {}

export const ChangeRuleGroupModalWrapper: React.FC<Props> = () => {
  const { setOpenChangeRecordsGroupModalAction } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [rulesToChange, setRulesToChange] = useState<Rule[]>([]);
  const [onSuccess, setOnSuccess] = useState<() => void>(() => {});

  useEffect(() => {
    const openModal = (rules: Rule[], onSuccess: Function) => {
      setRulesToChange(rules);
      setIsModalActive(true);
      setOnSuccess(() => onSuccess);
    };

    setOpenChangeRecordsGroupModalAction(() => openModal);
  }, [setOpenChangeRecordsGroupModalAction]);

  const onClose = () => {
    setRulesToChange([]);
    setIsModalActive(false);
  };

  return isModalActive ? (
    <ChangeRuleGroupModal
      clearSearch={() => {}}
      isOpen={isModalActive}
      toggle={onClose}
      mode="SELECTED_RULES"
      selectedRules={rulesToChange}
      onGroupChanged={onSuccess}
    />
  ) : null;
};
