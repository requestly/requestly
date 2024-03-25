import React, { useEffect, useState } from "react";
import { useRulesContext } from "../../../../../context";
import ChangeRuleGroupModal from "components/features/rules/ChangeRuleGroupModal";
import { Rule } from "features/rules/types/rules";

interface Props {}

export const ChangeRuleGroupModalWrapper: React.FC<Props> = () => {
  const { setChangeRulesGroupAction } = useRulesContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [rulesToChange, setRulesToChange] = useState<Rule[]>([]);
  const [onSuccess, setOnSuccess] = useState<() => void>(() => {});

  useEffect(() => {
    const changeRulesGroup = (rules: Rule[], onSuccess: Function) => {
      setRulesToChange(rules);
      setIsModalActive(true);
      setOnSuccess(() => onSuccess);
    };

    setChangeRulesGroupAction(() => changeRulesGroup);
  }, [setChangeRulesGroupAction]);

  const onClose = () => {
    setRulesToChange([]);
    setIsModalActive(false);
  };

  return isModalActive ? (
    <ChangeRuleGroupModal
      clearSearch={() => {}} // FIXME
      isOpen={isModalActive}
      toggle={onClose}
      mode="SELECTED_RULES"
      selectedRules={rulesToChange}
      onGroupChanged={onSuccess} // FIXME
    />
  ) : null;
};
