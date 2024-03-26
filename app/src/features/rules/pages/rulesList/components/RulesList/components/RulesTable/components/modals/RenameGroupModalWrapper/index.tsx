import React, { useEffect, useState } from "react";
import { useRulesContext } from "../../../../../context";
import RenameGroupModal from "components/features/rules/RenameGroupModal";
import { Group } from "features/rules/types/rules";

export const RenameGroupModalWrapper: React.FC = () => {
  const { setRenameGroupAction } = useRulesContext();

  const [isModalActive, setModalActive] = useState(false);
  const [groupToRename, setGroupToRename] = useState<Group | null>(null);

  useEffect(() => {
    const renameGroup = (group: Group) => {
      setGroupToRename(group);
      setModalActive(true);
    };

    setRenameGroupAction(() => renameGroup);
  }, [setRenameGroupAction]);

  const onClose = () => {
    setGroupToRename(null);
    setModalActive(false);
  };

  return isModalActive ? <RenameGroupModal toggle={onClose} isOpen={isModalActive} groupId={groupToRename.id} /> : null;
};
