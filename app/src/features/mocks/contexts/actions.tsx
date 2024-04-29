import React, { createContext, useCallback, useContext } from "react";
import Logger from "../../../../../common/logger";
import { useMocksModalsContext } from "./modals";
import { MockType, RQMockMetadataSchema, RQMockSchema } from "components/features/mocksV2/types";
import { message } from "antd";
import { updateMock } from "backend/mocks/updateMock";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { trackMockStarToggledEvent, trackMockUploadWorkflowStarted } from "modules/analytics/events/features/mocksV2";

type MocksActionContextType = {
  createNewCollectionAction: (mockType: MockType) => void;
  updateCollectionNameAction: (mockType: MockType, record: RQMockMetadataSchema) => void;
  deleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  deleteMockModalAction: (record: RQMockMetadataSchema) => void;
  updateMockCollectionModalAction: (record: RQMockMetadataSchema) => void;
  toggleMockStarAction: (record: RQMockSchema, onSuccess?: () => void) => void;
  mockUploaderModalAction: (mockType: MockType) => void;
};

const MocksActionContext = createContext<MocksActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const MocksActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const {
    openCollectionModalAction,
    openDeleteCollectionModalAction,
    openDeleteMockModalAction,
    openUpdateMockCollectionModalAction,
    openMockUploaderModalAction,
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

  const updateMockCollectionModalAction = useCallback(
    (record: RQMockMetadataSchema) => {
      Logger.log("[DEBUG]", "updateMockCollectionModalAction", { record });
      openUpdateMockCollectionModalAction(record);
    },
    [openUpdateMockCollectionModalAction]
  );

  const toggleMockStarAction = useCallback(
    (record: RQMockSchema, onSuccess?: () => void) => {
      const isStarred = record.isFavourite;
      const updatedValue = !isStarred;

      message.loading(isStarred ? "Removing from starred mocks" : "Adding into starred mocks", 3);

      updateMock(uid, record.id, { ...record, isFavourite: updatedValue }, teamId).then(() => {
        trackMockStarToggledEvent(record.id, record.type, record?.fileType, updatedValue);
        message.success(isStarred ? "Mock unstarred!" : "Mock starred!");
        onSuccess?.();
      });
    },
    [teamId]
  );

  const mockUploaderModalAction = useCallback(
    (mockType: MockType) => {
      Logger.log("[DEBUG]", "mockUploaderModalAction", { mockType });
      trackMockUploadWorkflowStarted(mockType);
      openMockUploaderModalAction(mockType);
    },
    [openMockUploaderModalAction]
  );

  const value = {
    createNewCollectionAction,
    updateCollectionNameAction,
    deleteCollectionModalAction,
    deleteMockModalAction,
    updateMockCollectionModalAction,
    toggleMockStarAction,
    mockUploaderModalAction,
  };

  return <MocksActionContext.Provider value={value}>{children}</MocksActionContext.Provider>;
};

export const useMocksActionContext = () => useContext(MocksActionContext);
