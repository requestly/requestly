import React, { createContext, useContext, useState } from "react";
import { MockType, RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";

type MocksModalsContextType = {
  openCollectionModalAction: (mockType: MockType, record?: RQMockCollection) => void;
  setOpenCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  setOpenDeleteCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteRecordsModalAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  setOpenDeleteRecordsModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openUpdateMocksCollectionModalAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  setOpenUpdateMocksCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openMockUploaderModalAction: (mockType: MockType) => void;
  setOpenMockUploaderModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openNewFileModalAction: (collectionId?: string) => void;
  setOpenNewFileModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openShareMocksModalAction: (selectedMockIds: string[], onSuccess?: () => void) => void;
  setOpenShareMocksModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openMocksImportModalAction: (mockType: MockType, source: string, onSuccess?: () => void) => void;
  setOpenMocksImportModalAction: React.Dispatch<React.SetStateAction<() => void>>;
};

const MocksModalsContext = createContext<MocksModalsContextType>(null);

interface MocksModalsContextProviderProps {
  children: React.ReactElement;
}

const DEFAULT_ACTION = () => {};

type ModalAction = () => void;

export const MocksModalsContextProvider: React.FC<MocksModalsContextProviderProps> = ({ children }) => {
  const [openCollectionModalAction, setOpenCollectionModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openDeleteCollectionModalAction, setOpenDeleteCollectionModalAction] = useState<ModalAction>(
    () => DEFAULT_ACTION
  );
  const [openDeleteRecordsModalAction, setOpenDeleteRecordsModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openUpdateMocksCollectionModalAction, setOpenUpdateMocksCollectionModalAction] = useState<ModalAction>(
    () => DEFAULT_ACTION
  );
  const [openMockUploaderModalAction, setOpenMockUploaderModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openNewFileModalAction, setOpenNewFileModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openShareMocksModalAction, setOpenShareMocksModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openMocksImportModalAction, setOpenMocksImportModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);

  const value = {
    openCollectionModalAction,
    setOpenCollectionModalAction,

    openDeleteCollectionModalAction,
    setOpenDeleteCollectionModalAction,

    openDeleteRecordsModalAction,
    setOpenDeleteRecordsModalAction,

    openUpdateMocksCollectionModalAction,
    setOpenUpdateMocksCollectionModalAction,

    openMockUploaderModalAction,
    setOpenMockUploaderModalAction,

    openNewFileModalAction,
    setOpenNewFileModalAction,

    openShareMocksModalAction,
    setOpenShareMocksModalAction,

    openMocksImportModalAction,
    setOpenMocksImportModalAction,
  };

  return <MocksModalsContext.Provider value={value}>{children}</MocksModalsContext.Provider>;
};

export const useMocksModalsContext = () => useContext(MocksModalsContext);
