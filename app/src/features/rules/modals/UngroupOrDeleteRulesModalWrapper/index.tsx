import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import React, { useCallback, useEffect, useState } from "react";
import UngroupOrDeleteRulesModal from "components/features/rules/UngroupOrDeleteRulesModal";
import { Group, Rule } from "features/rules/types/rules";
import { useRulesModalsContext } from "features/rules/context/modals";
import { StorageService } from "init";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

interface Props {}

export const UngroupOrDeleteRulesModalWrapper: React.FC<Props> = () => {
  const { setOpenGroupDeleteModalAction } = useRulesModalsContext();

  const appMode = useSelector(getAppMode);

  const [isModalActive, setIsModalActive] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const [groupRules, setGroupRules] = useState<Rule[]>([]);

  const getAllRulesofGroup = useCallback(
    async (groupId: Group["id"]) => {
      return await StorageService(appMode)
        .getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE)
        .then((rules: Rule[]) => {
          const groupRules = rules.filter((rule) => rule.groupId === groupId);
          return groupRules;
        });
    },
    [appMode]
  );

  useEffect(() => {
    const openModal = async (group: Group) => {
      const storageRules = await getAllRulesofGroup(group.id);
      setGroupRules(storageRules);
      setGroupToDelete(group);
      setIsModalActive(true);
    };

    setOpenGroupDeleteModalAction(() => openModal);
  }, [setOpenGroupDeleteModalAction, getAllRulesofGroup]);

  const onClose = () => {
    setGroupToDelete(null);
    setIsModalActive(false);
  };

  return isModalActive ? (
    <UngroupOrDeleteRulesModal
      groupIdToDelete={groupToDelete?.id}
      groupRules={groupRules}
      isOpen={isModalActive}
      toggle={onClose}
      callback={() => {}}
    />
  ) : null;
};
