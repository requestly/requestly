import React from "react";
import { useRulesContext } from "../../../../RulesListIndex/context";
import useRuleTableActions from "../../../hooks/useRuleTableActions";
import RenameGroupModal from "components/features/rules/RenameGroupModal";

export const RenameGroupModalWrapper: React.FC = () => {
  const { isRenameGroupModalActive, idOfGroupToRename } = useRulesContext();
  const { closeRenameGroupModal } = useRuleTableActions();

  return isRenameGroupModalActive ? (
    <RenameGroupModal toggle={closeRenameGroupModal} isOpen={isRenameGroupModalActive} groupId={idOfGroupToRename} />
  ) : null;
};
