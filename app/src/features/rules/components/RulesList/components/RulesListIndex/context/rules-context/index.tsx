import React, { createContext, useContext, useState } from "react";
import { StorageRecord } from "features/rules/types/rules";

type RulesListContext = { selectedRows: StorageRecord[] } & Record<string, any>; // why is this extension of type necessary?

const RulesContext = createContext<RulesListContext>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const RulesListProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const [selectedRows, setSelectedRows] = useState<StorageRecord[]>([]);
  const [ruleToDuplicate, setRuleToDuplicate] = useState(null);
  const [ruleToViewInModal, setRuleToViewInModal] = useState(false);
  const [isDuplicateRuleModalActive, setIsDuplicateRuleModalActive] = useState(false);
  const [isDeleteConfirmationModalActive, setIsDeleteConfirmationModalActive] = useState(false);
  const [isSharedListRuleViewerModalActive, setIsSharedListRuleViewModalActive] = useState(false);
  const [groupToEmpty, setGroupToEmpty] = useState(null);
  const [isUngroupOrDeleteRulesModalActive, setIsUngroupOrDeleteRulesModalActive] = useState(false);
  const [isRenameGroupModalActive, setIsRenameGroupModalActive] = useState(false);
  const [idOfGroupToRename, setIdOfGroupToRename] = useState<number>(null);
  const [isChangeGroupModalActive, setIsChangeGroupModalActive] = useState(false);

  // FIXME: add proper types
  const value = {
    selectedRows,
    setSelectedRows,
    isChangeGroupModalActive,
    setIsChangeGroupModalActive,
    ruleToViewInModal,
    ruleToDuplicate,
    isRenameGroupModalActive,
    setIsRenameGroupModalActive,
    idOfGroupToRename,
    setIdOfGroupToRename,
    isDeleteConfirmationModalActive,
    isSharedListRuleViewerModalActive,
    isUngroupOrDeleteRulesModalActive,
    groupToEmpty,
    setGroupToEmpty,
    setRuleToDuplicate,
    setIsDuplicateRuleModalActive,
    isDuplicateRuleModalActive,
    setRuleToViewInModal,
    setIsDeleteConfirmationModalActive,
    setIsSharedListRuleViewModalActive,
    setIsUngroupOrDeleteRulesModalActive,
  };

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>;
};

export const useRulesContext = () => useContext(RulesContext);
