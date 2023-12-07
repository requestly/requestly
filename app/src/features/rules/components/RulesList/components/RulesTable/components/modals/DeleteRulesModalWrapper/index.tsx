import React, { useMemo } from "react";
import { useRulesContext } from "../../../../RulesListIndex/context";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import useRuleTableActions from "../../../hooks/useRuleTableActions";

export const DeleteRulesModalWrapper: React.FC = () => {
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
    />
  ) : null;
};
