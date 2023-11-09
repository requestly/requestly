import React, { createContext, useContext, useState } from "react";

const RulesContext = createContext(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const RulesListProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const [ruleToDuplicate, setRuleToDuplicate] = useState(null);
  const [ruleToViewInModal, setRuleToViewInModal] = useState(false);
  const [isDuplicateRuleModalActive, setIsDuplicateRuleModalActive] = useState(false);
  const [isDeleteConfirmationModalActive, setIsDeleteConfirmationModalActive] = useState(false);
  const [isSharedListRuleViewerModalActive, setIsSharedListRuleViewModalActive] = useState(false);
  const [isUngroupOrDeleteRulesModalActive, setIsUngroupOrDeleteRulesModalActive] = useState(false);
  const [isRenameGroupModalActive, setIsRenameGroupModalActive] = useState(false);
  const [idOfGroupToRename, setIdOfGroupToRename] = useState<number>(null);
  const [isChangeGroupModalActive, setIsChangeGroupModalActive] = useState(false);

  // FIXME: add proper types
  const value = {
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
