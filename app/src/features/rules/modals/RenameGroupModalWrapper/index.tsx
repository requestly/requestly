import React, { useEffect, useState } from "react";
import RenameGroupModal from "components/features/rules/RenameGroupModal";
import { Group } from "@requestly/shared/types/entities/rules";
import { useRulesModalsContext } from "features/rules/context/modals";

export const RenameGroupModalWrapper: React.FC = () => {
  const { setOpenRenameGroupModalAction } = useRulesModalsContext();

  const [isModalActive, setModalActive] = useState(false);
  const [groupToRename, setGroupToRename] = useState<Group | null>(null);

  useEffect(() => {
    const openModal = (group: Group) => {
      setGroupToRename(group);
      setModalActive(true);
    };

    setOpenRenameGroupModalAction(() => openModal);
  }, [setOpenRenameGroupModalAction]);

  const onClose = () => {
    setGroupToRename(null);
    setModalActive(false);
  };

  return isModalActive ? <RenameGroupModal toggle={onClose} isOpen={isModalActive} groupId={groupToRename.id} /> : null;
};
