import React, { createContext, useCallback, useContext } from "react";
import Logger from "../../../../../common/logger";
import { useMocksModalsContext } from "./modals";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";

type MocksActionContextType = {
  createNewCollectionAction: (mockType: MockType) => void;
  updateCollectionNameAction: (mockType: MockType, record: RQMockMetadataSchema) => void;
  deleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  deleteMockModalAction: (record: RQMockMetadataSchema) => void;
};

const MocksActionContext = createContext<MocksActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const MocksActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const {
    openCollectionModalAction,
    openDeleteCollectionModalAction,
    openDeleteMockModalAction,
  } = useMocksModalsContext();

  const createNewCollectionAction = useCallback(
    (mockType: MockType) => {
      Logger.log("[DEBUG]", "createNewCollectionAction", { mockType });
      openCollectionModalAction(mockType);
    },
    [openCollectionModalAction]
  );

  const updateCollectionNameAction = useCallback(
    (mockType: MockType, record: RQMockMetadataSchema) => {
      Logger.log("[DEBUG]", "updateCollectionNameAction", { record, mockType });
      openCollectionModalAction(mockType, record);
    },
    [openCollectionModalAction]
  );

  const deleteCollectionModalAction = useCallback(
    (record: RQMockMetadataSchema) => {
      Logger.log("[DEBUG]", "deleteCollectionModalAction", { record });
      openDeleteCollectionModalAction(record);
    },
    [openDeleteCollectionModalAction]
  );

  const deleteMockModalAction = useCallback(
    (record: RQMockMetadataSchema) => {
      Logger.log("[DEBUG]", "deleteMockModalAction", { record });
      openDeleteMockModalAction(record);
    },
    [openDeleteMockModalAction]
  );

  const value = {
    createNewCollectionAction,
    updateCollectionNameAction,
    deleteCollectionModalAction,
    deleteMockModalAction,
  };

  return <MocksActionContext.Provider value={value}>{children}</MocksActionContext.Provider>;
};

export const useMocksActionContext = () => useContext(MocksActionContext);
