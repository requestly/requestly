import React, { useEffect, useState } from "react";
import UngroupOrDeleteRulesModal from "components/features/rules/UngroupOrDeleteRulesModal";
import { Group } from "@requestly/shared/types/entities/rules";
import { useRulesModalsContext } from "features/rules/context/modals";

interface Props {}

export const UngroupOrDeleteRulesModalWrapper: React.FC<Props> = () => {
  const { setOpenGroupDeleteModalAction } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  useEffect(() => {
    const openModal = (group: Group) => {
      setGroupToDelete(group);
      setIsModalActive(true);
    };

    setOpenGroupDeleteModalAction(() => openModal);
  }, [setOpenGroupDeleteModalAction]);

  const onClose = () => {
    setGroupToDelete(null);
    setIsModalActive(false);
  };

  return isModalActive ? (
    <UngroupOrDeleteRulesModal
      groupIdToDelete={groupToDelete?.id}
      // @ts-ignore
      groupRules={groupToDelete?.children ?? []}
      isOpen={isModalActive}
      toggle={onClose}
      callback={() => {}}
    />
  ) : null;
};
