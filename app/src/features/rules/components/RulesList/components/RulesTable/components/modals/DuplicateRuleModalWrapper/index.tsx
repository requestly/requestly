import React from "react";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";
import useRuleTableActions from "../../../hooks/useRuleTableActions";
import { useRulesContext } from "../../../../RulesListIndex/context";
import { Rule } from "types";

export const DuplicateRuleModalWrapper: React.FC = () => {
  const { isDuplicateRuleModalActive, ruleToDuplicate } = useRulesContext();
  const { closeDuplicateRuleModal } = useRuleTableActions();

  return isDuplicateRuleModalActive ? (
    <DuplicateRuleModal
      close={closeDuplicateRuleModal}
      onDuplicate={closeDuplicateRuleModal}
      isOpen={isDuplicateRuleModalActive as boolean}
      rule={ruleToDuplicate as Rule}
    />
  ) : null;
};
