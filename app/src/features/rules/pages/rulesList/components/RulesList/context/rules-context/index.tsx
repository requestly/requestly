import React, { createContext, useContext, useState } from "react";
import { StorageRecord } from "features/rules/types/rules";

type RulesListContext = { selectedRows: StorageRecord[] } & Record<string, any>; // why is this extension of type necessary?

const RulesContext = createContext<RulesListContext>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const RulesListProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const [selectedRows, setSelectedRows] = useState<StorageRecord[]>([]);

  // Modal Actions
  const [deleteGroupAction, setDeleteGroupAction] = useState<() => void>(async () => () => {});
  const [deleteRecordsAction, setDeleteRecordsAction] = useState<() => void>(async () => () => {});
  const [duplicateRuleAction, setDuplicateRuleAction] = useState<() => void>(async () => () => {});
  const [renameGroupAction, setRenameGroupAction] = useState<() => void>(async () => () => {});
  const [importRecordsAction, setImportRecordsAction] = useState<() => void>(async () => () => {});
  const [createGroupAction, setCreateGroupAction] = useState<() => void>(async () => () => {});
  const [changeRulesGroupAction, setChangeRulesGroupAction] = useState<() => void>(async () => () => {});

  // FIXME: add proper types
  const value = {
    selectedRows,
    setSelectedRows,

    changeRulesGroupAction,
    setChangeRulesGroupAction,

    importRecordsAction,
    setImportRecordsAction,

    createGroupAction,
    setCreateGroupAction,

    deleteGroupAction,
    setDeleteGroupAction,

    renameGroupAction,
    setRenameGroupAction,

    duplicateRuleAction,
    setDuplicateRuleAction,

    //
    deleteRecordsAction,
    setDeleteRecordsAction,
  };

  return <RulesContext.Provider value={value}>{children}</RulesContext.Provider>;
};

export const useRulesContext = () => useContext(RulesContext);
