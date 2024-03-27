import React, { useEffect, useState } from "react";
import UngroupOrDeleteRulesModal from "components/features/rules/UngroupOrDeleteRulesModal";
import { useRulesContext } from "../../../../../context";
import { Group } from "features/rules/types/rules";

interface Props {}

export const UngroupOrDeleteRulesModalWrapper: React.FC<Props> = () => {
  const { setRenameGroupAction } = useRulesContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  useEffect(() => {
    const renameGroup = (group: Group) => {
      setGroupToDelete(group);
      setIsModalActive(true);
    };

    setRenameGroupAction(() => renameGroup);
  }, [setRenameGroupAction]);

  const onClose = () => {
    setGroupToDelete(null);
    setIsModalActive(false);
  };

  return isModalActive ? (
    <UngroupOrDeleteRulesModal
      groupIdToDelete={groupToDelete?.id}
      groupRules={groupToDelete?.children ?? []}
      isOpen={isModalActive}
      toggle={onClose}
      callback={() => {}}
    />
  ) : null;
};
