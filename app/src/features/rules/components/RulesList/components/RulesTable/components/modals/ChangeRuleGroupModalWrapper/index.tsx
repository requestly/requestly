import React from "react";
import { useRulesContext } from "../../../../RulesListIndex/context";
import useRuleTableActions from "../../../hooks/useRuleTableActions";
import ChangeRuleGroupModal from "components/features/rules/ChangeRuleGroupModal";

interface Props {
  clearSelection: () => void;
}

export const ChangeRuleGroupModalWrapper: React.FC<Props> = ({ clearSelection }) => {
  const { selectedRows, isChangeGroupModalActive } = useRulesContext();
  const { closeChangeRuleGroupModal, clearSelectedRows } = useRuleTableActions();

  return isChangeGroupModalActive ? (
    <ChangeRuleGroupModal
      clearSearch={clearSelectedRows} // FIXME
      isOpen={isChangeGroupModalActive}
      toggle={closeChangeRuleGroupModal}
      mode="SELECTED_RULES"
      selectedRules={selectedRows}
      onGroupChanged={clearSelection}
    />
  ) : null;
};
