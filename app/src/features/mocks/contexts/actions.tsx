import React, { createContext, useCallback, useContext } from "react";
import Logger from "../../../../../common/logger";
import { useMocksModalsContext } from "./modals";
import {
  MockListSource,
  MockRecordType,
  MockType,
  RQMockCollection,
  RQMockMetadataSchema,
  RQMockSchema,
} from "components/features/mocksV2/types";
import { updateMock } from "backend/mocks/updateMock";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import {
  trackMockImportClicked,
  trackMockStarToggledEvent,
  trackMockUploadWorkflowStarted,
  trackNewMockButtonClicked,
} from "modules/analytics/events/features/mocksV2";
import { useNavigate } from "react-router-dom";
import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { isMock, isCollection } from "../screens/mocksList/components/MocksList/components/MocksTable/utils";
import { updateMocksCollection } from "backend/mocks/updateMocksCollection";
import { DEFAULT_COLLECTION_ID, DEFAULT_COLLECTION_PATH } from "../constants";

type MocksActionContextType = {
  createNewCollectionAction: (mockType: MockType) => void;
  updateCollectionNameAction: (mockType: MockType, record: RQMockCollection) => void;
  deleteCollectionAction: (record: RQMockMetadataSchema) => void;
  deleteRecordsAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  updateMocksCollectionAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  toggleMockStarAction: (record: RQMockSchema, onSuccess?: () => void) => void;
  uploadMockAction: (mockType: MockType) => void;
  createNewFileAction: () => void;
  createNewMockAction: (mockType: MockType, source: MockListSource, collectionId?: string) => void;
  removeMocksFromCollectionAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  exportMocksAction: (records: RQMockMetadataSchema[], onSuccess?: () => void) => void;
  importMocksAction: (mockType: MockType, source: string, onSuccess?: () => void) => void;
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
    openShareMocksModalAction,
    openMocksImportModalAction,
  } = useMocksModalsContext();

  const createNewCollectionAction = useCallback(
    (mockType: MockType) => {
      Logger.log("[DEBUG]", "createNewCollectionAction", { mockType });
      openCollectionModalAction(mockType);
    },
    [openCollectionModalAction]
  );

  const updateCollectionNameAction = useCallback(
    (mockType: MockType, record: RQMockCollection) => {
      Logger.log("[DEBUG]", "updateCollectionNameAction", { record, mockType });
      openCollectionModalAction(mockType, record);
    },
    [openCollectionModalAction]
  );

  const deleteCollectionAction = useCallback(
    (record: RQMockMetadataSchema) => {
      Logger.log("[DEBUG]", "deleteCollectionAction", { record });
      openDeleteCollectionModalAction(record);
    },
    [openDeleteCollectionModalAction]
  );

  const deleteRecordsAction = useCallback(
    (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "deleteRecordsAction", { records });
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

      const recordType =
        record.recordType === MockRecordType.COLLECTION ? "Collection" : record.type === MockType.API ? "Mock" : "File";

      toast.loading(isStarred ? `Unstarring ${recordType}...` : `Starring ${recordType}...`, 3);

      updateMock(uid, record.id, { ...record, isFavourite: updatedValue }, teamId).then(() => {
        trackMockStarToggledEvent(record.id, record.type, record?.fileType, updatedValue, record.recordType);
        toast.success(isStarred ? `${recordType} unstarred!` : `${recordType} starred!`);
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
    (type: MockType, source: MockListSource, collectionId: string = "") => {
      Logger.log("[DEBUG]", "createNewMockAction", { source, type });

      if (source === MockListSource.PICKER_MODAL) {
        trackNewMockButtonClicked(type, "picker_modal");
        return redirectToMockEditorCreateMock(navigate, true, collectionId);
      }
      if (type === MockType.FILE) {
        return openNewFileModalAction(collectionId);
      }
      trackNewMockButtonClicked(type, "mock_list");
      return redirectToMockEditorCreateMock(navigate, false, collectionId);
    },
    [openNewFileModalAction, navigate]
  );

  const removeMocksFromCollectionAction = useCallback(
    async (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "removeMocksFromCollectionAction", { records });
      const mockIds = records.filter(isMock).map((mock) => mock.id);

      updateMocksCollection(uid, mockIds, DEFAULT_COLLECTION_ID, DEFAULT_COLLECTION_PATH, teamId).then(() => {
        toast.success(`${mockIds.length > 1 ? "Mocks" : "Mock"} removed from collection!`);
        onSuccess?.();
      });
    },
    [uid, teamId]
  );

  const exportMocksAction = useCallback(
    async (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "exportMocksAction", { records });

      const mockIds: Record<RQMockMetadataSchema["id"], RQMockMetadataSchema> = {};
      const collectionIds: RQMockMetadataSchema["id"][] = [];

      records.forEach((record) => {
        if (isCollection(record)) {
          collectionIds.push(record.id);

          // add all the child mocks too
          ((record as unknown) as RQMockCollection)?.children?.forEach((mock) => {
            mockIds[mock.id] = mock;
          });
        } else {
          mockIds[record.id] = record;
        }
      });

      const selectedRecordIds = [...Object.keys(mockIds), ...collectionIds];

      openShareMocksModalAction(selectedRecordIds, onSuccess);
    },
    [openShareMocksModalAction]
  );

  const importMocksAction = useCallback(
    (mockType: MockType, source: string, onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "importMocksAction", { mockType });
      trackMockImportClicked(mockType, source);
      openMocksImportModalAction(mockType, source, onSuccess);
    },
    [openMocksImportModalAction]
  );

  const value = {
    createNewCollectionAction,
    updateCollectionNameAction,
    deleteCollectionAction,
    deleteRecordsAction,
    updateMocksCollectionAction,
    toggleMockStarAction,
    uploadMockAction,
    createNewFileAction,
    createNewMockAction,
    removeMocksFromCollectionAction,
    exportMocksAction,
    importMocksAction,
  };

  return <MocksActionContext.Provider value={value}>{children}</MocksActionContext.Provider>;
};

export const useMocksActionContext = () => useContext(MocksActionContext);
