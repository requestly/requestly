import React, { useMemo } from "react";
import { useRulesContext } from "../../../../RulesListIndex/context";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import useRuleTableActions from "../../../hooks/useRuleTableActions";

interface Props {
  clearSelection: () => void;
}

export const DeleteRulesModalWrapper: React.FC<Props> = ({ clearSelection }) => {
  const { selectedRows, isDeleteConfirmationModalActive, clearSelectedRows } = useRulesContext();
  const { closeDeleteRuleModal } = useRuleTableActions();

  const rulesToDelete = useMemo(() => selectedRows.filter((row) => !row.id?.startsWith("Group")), [selectedRows]);

  const selectedGroupIds = useMemo(() => selectedRows.map((row) => row.id).filter((id) => id?.startsWith("Group")), [
    selectedRows,
  ]);

  return isDeleteConfirmationModalActive ? (
    <DeleteRulesModal
      toggle={closeDeleteRuleModal}
      rulesToDelete={rulesToDelete}
      groupIdsToDelete={selectedGroupIds}
      clearSearch={clearSelectedRows} // FIXME
      isOpen={isDeleteConfirmationModalActive}
      ruleDeletedCallback={clearSelection}
      analyticEventSource="rules_list"
    />
  ) : null;
};
