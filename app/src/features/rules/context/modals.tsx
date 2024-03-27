/**
 * Contains all the common modals and state
 */

import React, { createContext, useContext, useState } from "react";
import { Group, Rule, StorageRecord } from "../types/rules";

type RulesModalsContextType = {
  openCreateGroupModal: () => void;
  setOpenCreateGroupModal: React.Dispatch<React.SetStateAction<() => void>>;

  openImportRecordsModal: () => void;
  setOpenImportRecordsModal: React.Dispatch<React.SetStateAction<() => void>>;

  openChangeRecordsGroupModal: (rules: Rule[], onSuccess: Function) => void;
  setOpenChangeRecordsGroupModal: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteRecordsModal: (records: StorageRecord[], onSuccess?: Function) => void;
  setOpenDeleteRecordsModal: React.Dispatch<React.SetStateAction<() => void>>;

  openDuplicateRecordModal: (record: StorageRecord) => void;
  setOpenDuplicateRecordModal: React.Dispatch<React.SetStateAction<() => void>>;

  openRenameGroupModal: (record: StorageRecord) => void;
  setOpenRenameGroupModal: React.Dispatch<React.SetStateAction<() => void>>;

  openGroupDeleteModal: (record: Group) => void;
  setOpenGroupDeleteModal: React.Dispatch<React.SetStateAction<() => void>>;
};

const RulesModalsContext = createContext<RulesModalsContextType>(null);

interface RulesModalsContextProviderProps {
  children: React.ReactElement;
}

export const RulesModalsContextProvider: React.FC<RulesModalsContextProviderProps> = ({ children }) => {
  const [openCreateGroupModal, setOpenCreateGroupModal] = useState<() => void>(async () => () => {});
  const [openImportRecordsModal, setOpenImportRecordsModal] = useState<() => void>(async () => () => {});
  const [openChangeRecordsGroupModal, setOpenChangeRecordsGroupModal] = useState<() => void>(async () => () => {});
  const [openDeleteRecordsModal, setOpenDeleteRecordsModal] = useState<() => void>(async () => () => {});
  const [openDuplicateRecordModal, setOpenDuplicateRecordModal] = useState<() => void>(async () => () => {});
  const [openRenameGroupModal, setOpenRenameGroupModal] = useState<() => void>(async () => () => {});
  const [openGroupDeleteModal, setOpenGroupDeleteModal] = useState<() => void>(async () => () => {});

  const value = {
    openCreateGroupModal,
    setOpenCreateGroupModal,

    openImportRecordsModal,
    setOpenImportRecordsModal,

    openChangeRecordsGroupModal,
    setOpenChangeRecordsGroupModal,

    openDeleteRecordsModal,
    setOpenDeleteRecordsModal,

    openDuplicateRecordModal,
    setOpenDuplicateRecordModal,

    openRenameGroupModal,
    setOpenRenameGroupModal,

    openGroupDeleteModal,
    setOpenGroupDeleteModal,
  };

  return <RulesModalsContext.Provider value={value}>{children}</RulesModalsContext.Provider>;
};

export const useRulesModalsContext = () => useContext(RulesModalsContext);
