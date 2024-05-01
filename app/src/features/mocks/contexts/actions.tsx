import React, { createContext, useCallback, useContext } from "react";
import Logger from "../../../../../common/logger";
import { useMocksModalsContext } from "./modals";
import { MockListSource, MockType, RQMockMetadataSchema, RQMockSchema } from "components/features/mocksV2/types";
import { updateMock } from "backend/mocks/updateMock";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  trackMockStarToggledEvent,
  trackMockUploadWorkflowStarted,
  trackNewMockButtonClicked,
} from "modules/analytics/events/features/mocksV2";
import { useNavigate } from "react-router-dom";
import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { isRecordMock } from "../screens/mocksList/components/MocksList/components/MocksTable/utils";
import { updateMocksCollectionId } from "backend/mocks/updateMocksCollectionId";
import { DEFAULT_COLLECTION_ID } from "../constants";

type MocksActionContextType = {
  createNewCollectionAction: (mockType: MockType) => void;
  updateCollectionNameAction: (mockType: MockType, record: RQMockMetadataSchema) => void;
  deleteCollectionModalAction: (record: RQMockMetadataSchema) => void;
  deleteMockModalAction: (record: RQMockMetadataSchema) => void;
  updateMocksCollectionModalAction: (records: RQMockMetadataSchema[]) => void;
  toggleMockStarAction: (record: RQMockSchema, onSuccess?: () => void) => void;
  mockUploaderModalAction: (mockType: MockType) => void;
  newFileModalAction: () => void;
  createNewMock: (mockType: MockType, source: MockListSource) => void;
  removeMocksFromCollectionAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
};

const MocksActionContext = createContext<MocksActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const MocksActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const {
    openCollectionModalAction,
    openDeleteCollectionModalAction,
    openDeleteMockModalAction,
    openUpdateMocksCollectionModalAction,
    openMockUploaderModalAction,
    openNewFileModalAction,
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

  const updateMocksCollectionModalAction = useCallback(
    (records: RQMockMetadataSchema[]) => {
      Logger.log("[DEBUG]", "updateMocksCollectionModalAction", { records });
      openUpdateMocksCollectionModalAction(records);
    },
    [openUpdateMocksCollectionModalAction]
  );

  const toggleMockStarAction = useCallback(
    (record: RQMockSchema, onSuccess?: () => void) => {
      const isStarred = record.isFavourite;
      const updatedValue = !isStarred;

      toast.loading(isStarred ? "Unstarring Mock..." : "Starring Mock...", 3);

      updateMock(uid, record.id, { ...record, isFavourite: updatedValue }, teamId).then(() => {
        trackMockStarToggledEvent(record.id, record.type, record?.fileType, updatedValue);
        toast.success(isStarred ? "Mock unstarred!" : "Mock starred!");
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

  const newFileModalAction = useCallback(() => {
    Logger.log("[DEBUG]", "newFileModalAction", {});
    openNewFileModalAction();
  }, [openNewFileModalAction]);

  const createNewMock = useCallback(
    (type: MockType, source: MockListSource) => {
      Logger.log("[DEBUG]", "createNewMock", { source, type });

      if (source === MockListSource.PICKER_MODAL) {
        trackNewMockButtonClicked(type, "picker_modal");
        return redirectToMockEditorCreateMock(navigate, true);
      }
      if (type === MockType.FILE) {
        return openNewFileModalAction();
      }
      trackNewMockButtonClicked(type, "mock_list");
      return redirectToMockEditorCreateMock(navigate);
    },
    [openNewFileModalAction, navigate]
  );

  const removeMocksFromCollectionAction = useCallback(
    async (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      const mockIds = records.filter(isRecordMock).map((mock) => mock.id);

      updateMocksCollectionId(uid, mockIds, DEFAULT_COLLECTION_ID).then(() => {
        toast.success(`${mockIds.length > 1 ? "Mocks" : "Mock"} removed from collection!`);
        onSuccess?.();
      });
    },
    [uid]
  );

  const value = {
    createNewCollectionAction,
    updateCollectionNameAction,
    deleteCollectionModalAction,
    deleteMockModalAction,
    updateMocksCollectionModalAction,
    toggleMockStarAction,
    mockUploaderModalAction,
    newFileModalAction,
    createNewMock,
    removeMocksFromCollectionAction,
  };

  return <MocksActionContext.Provider value={value}>{children}</MocksActionContext.Provider>;
};

export const useMocksActionContext = () => useContext(MocksActionContext);
