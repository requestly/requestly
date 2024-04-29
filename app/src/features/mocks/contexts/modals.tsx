import React, { createContext, useContext, useState } from "react";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";

type MocksModalsContextType = {
  openCollectionModalAction: (mockType: MockType, record?: RQMockMetadataSchema) => void;
  setOpenCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  setOpenDeleteCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openDeleteMockModalAction: (record: RQMockMetadataSchema) => void;
  setOpenDeleteMockModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openUpdateMockCollectionModalAction: (record: RQMockMetadataSchema) => void;
  setOpenUpdateMockCollectionModalAction: React.Dispatch<React.SetStateAction<() => void>>;

  openMockUploaderModalAction: (mockType: MockType) => void;
  setOpenMockUploaderModalAction: React.Dispatch<React.SetStateAction<() => void>>;
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
  const [openDeleteMockModalAction, setOpenDeleteMockModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);
  const [openUpdateMockCollectionModalAction, setOpenUpdateMockCollectionModalAction] = useState<ModalAction>(
    () => DEFAULT_ACTION
  );
  const [openMockUploaderModalAction, setOpenMockUploaderModalAction] = useState<ModalAction>(() => DEFAULT_ACTION);

  const value = {
    openCollectionModalAction,
    setOpenCollectionModalAction,

    openDeleteCollectionModalAction,
    setOpenDeleteCollectionModalAction,

    openDeleteMockModalAction,
    setOpenDeleteMockModalAction,

    openUpdateMockCollectionModalAction,
    setOpenUpdateMockCollectionModalAction,

    openMockUploaderModalAction,
    setOpenMockUploaderModalAction,
  };

  return <MocksModalsContext.Provider value={value}>{children}</MocksModalsContext.Provider>;
};

export const useMocksModalsContext = () => useContext(MocksModalsContext);
