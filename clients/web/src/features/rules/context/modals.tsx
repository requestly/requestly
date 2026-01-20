/**
 * Contains all the common modals and state
 */

import { Group, Rule, StorageRecord } from "@requestly/shared/types/entities/rules";
import React, { createContext, useContext, useState } from "react";

type RulesModalsContextType = {
  openCreateGroupModalAction: () => void;
  setOpenCreateGroupModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openImportRecordsModalAction: () => void;
  setOpenImportRecordsModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openChangeRecordsGroupModalAction: (rules: Rule[], onSuccess: Function) => void;
  setOpenChangeRecordsGroupModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteRecordsModalAction: (records: StorageRecord[], onSuccess?: Function) => void;
  setOpenDeleteRecordsModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDuplicateRecordModalAction: (record: StorageRecord) => void;
  setOpenDuplicateRecordModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openRenameGroupModalAction: (record: StorageRecord) => void;
  setOpenRenameGroupModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openGroupDeleteModalAction: (record: Group) => void;
  setOpenGroupDeleteModalAction: React.Dispatch<React.SetStateAction<() => void>>;
};

const RulesModalsContext = createContext<RulesModalsContextType>(null);

interface RulesModalsContextProviderProps {
  children: React.ReactElement;
}

export const RulesModalsContextProvider: React.FC<RulesModalsContextProviderProps> = ({ children }) => {
  const [openCreateGroupModalAction, setOpenCreateGroupModalAction] = useState<() => void>(async () => () => {});
  const [openImportRecordsModalAction, setOpenImportRecordsModalAction] = useState<() => void>(async () => () => {});
  const [openChangeRecordsGroupModalAction, setOpenChangeRecordsGroupModalAction] = useState<() => void>(
    async () => () => {}
  );
  const [openDeleteRecordsModalAction, setOpenDeleteRecordsModalAction] = useState<() => void>(async () => () => {});
  const [openDuplicateRecordModalAction, setOpenDuplicateRecordModalAction] = useState<() => void>(
    async () => () => {}
  );
  const [openRenameGroupModalAction, setOpenRenameGroupModalAction] = useState<() => void>(async () => () => {});
  const [openGroupDeleteModalAction, setOpenGroupDeleteModalAction] = useState<() => void>(async () => () => {});

  const value = {
    openCreateGroupModalAction,
    setOpenCreateGroupModalAction,

    openImportRecordsModalAction,
    setOpenImportRecordsModalAction,

    openChangeRecordsGroupModalAction,
    setOpenChangeRecordsGroupModalAction,

    openDeleteRecordsModalAction,
    setOpenDeleteRecordsModalAction,

    openDuplicateRecordModalAction,
    setOpenDuplicateRecordModalAction,

    openRenameGroupModalAction,
    setOpenRenameGroupModalAction,

    openGroupDeleteModalAction,
    setOpenGroupDeleteModalAction,
  };

  return <RulesModalsContext.Provider value={value}>{children}</RulesModalsContext.Provider>;
};

export const useRulesModalsContext = () => useContext(RulesModalsContext);
