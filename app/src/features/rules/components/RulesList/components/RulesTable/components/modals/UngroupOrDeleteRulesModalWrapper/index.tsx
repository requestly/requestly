import React from "react";
import UngroupOrDeleteRulesModal from "components/features/rules/UngroupOrDeleteRulesModal";
import { useRulesContext } from "../../../../RulesListIndex/context";
import useRuleTableActions from "../../../hooks/useRuleTableActions";
import { Group } from "features/rules/types/rules";

interface Props {
  clearSelection: () => void;
}

export const UngroupOrDeleteRulesModalWrapper: React.FC<Props> = ({ clearSelection }) => {
  const { isUngroupOrDeleteRulesModalActive, groupToEmpty } = useRulesContext();
  const { closeUngroupOrDeleteRulesModal } = useRuleTableActions();
  const group = groupToEmpty as Group;

  return isUngroupOrDeleteRulesModalActive ? (
    <UngroupOrDeleteRulesModal
      groupIdToDelete={group?.id}
      groupRules={group?.children ?? []}
      isOpen={isUngroupOrDeleteRulesModalActive}
      toggle={closeUngroupOrDeleteRulesModal}
      callback={clearSelection}
    />
  ) : null;
};
