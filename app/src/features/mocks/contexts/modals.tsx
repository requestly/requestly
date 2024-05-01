import React, { createContext, useContext, useState } from "react";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";

type MocksModalsContextType = {
  openCollectionModalAction: (mockType: MockType, record?: RQMockMetadataSchema) => void;
  setOpenCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  setOpenDeleteCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeletRecordsModalAction: (records: RQMockMetadataSchema[]) => void;
  setOpenDeleteRecordsModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openUpdateMocksCollectionModalAction: (records: RQMockMetadataSchema[]) => void;
  setOpenUpdateMocksCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openMockUploaderModalAction: (mockType: MockType) => void;
  setOpenMockUploaderModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openNewFileModalAction: () => void;
  setOpenNewFileModalAction: React.Dispatch<React.SetStateAction<() => void>>;
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
  const [openDeletRecordsModalAction, setOpenDeleteRecordsModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openUpdateMocksCollectionModalAction, setOpenUpdateMocksCollectionModalAction] = useState<ModalAction>(
    () => DEFAULT_ACTION
  );
  const [openMockUploaderModalAction, setOpenMockUploaderModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openNewFileModalAction, setOpenNewFileModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);

  const value = {
    openCollectionModalAction,
    setOpenCollectionModalAction,

    openDeleteCollectionModalAction,
    setOpenDeleteCollectionModalAction,

    openDeletRecordsModalAction,
    setOpenDeleteRecordsModalAction,

    openUpdateMocksCollectionModalAction,
    setOpenUpdateMocksCollectionModalAction,

    openMockUploaderModalAction,
    setOpenMockUploaderModalAction,

    openNewFileModalAction,
    setOpenNewFileModalAction,
  };

  return <MocksModalsContext.Provider value={value}>{children}</MocksModalsContext.Provider>;
};

export const useMocksModalsContext = () => useContext(MocksModalsContext);
