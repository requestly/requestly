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
  deleteRecordsModalAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  updateMocksCollectionAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  toggleMockStarAction: (record: RQMockSchema, onSuccess?: () => void) => void;
  uploadMockAction: (mockType: MockType) => void;
  createNewFileAction: () => void;
  createNewMockAction: (mockType: MockType, source: MockListSource) => void;
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
    openDeleteRecordsModalAction,
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

  const deleteRecordsModalAction = useCallback(
    (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "deleteRecordsModalAction", { records });
      openDeleteRecordsModalAction(records, onSuccess);
    },
    [openDeleteRecordsModalAction]
  );

  const updateMocksCollectionAction = useCallback(
    (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "updateMocksCollectionAction", { records });
      openUpdateMocksCollectionModalAction(records, onSuccess);
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

  const uploadMockAction = useCallback(
    (mockType: MockType) => {
      Logger.log("[DEBUG]", "uploadMockAction", { mockType });
      trackMockUploadWorkflowStarted(mockType);
      openMockUploaderModalAction(mockType);
    },
    [openMockUploaderModalAction]
  );

  const createNewFileAction = useCallback(() => {
    Logger.log("[DEBUG]", "createNewFileAction", {});
    openNewFileModalAction();
  }, [openNewFileModalAction]);

  const createNewMockAction = useCallback(
    (type: MockType, source: MockListSource) => {
      Logger.log("[DEBUG]", "createNewMockAction", { source, type });

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
      Logger.log("[DEBUG]", "removeMocksFromCollectionAction", { records });
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
    deleteRecordsModalAction,
    updateMocksCollectionAction,
    toggleMockStarAction,
    uploadMockAction,
    createNewFileAction,
    createNewMockAction,
    removeMocksFromCollectionAction,
  };

  return <MocksActionContext.Provider value={value}>{children}</MocksActionContext.Provider>;
};

export const useMocksActionContext = () => useContext(MocksActionContext);
