import React, { createContext, useCallback, useContext, useEffect } from "react";
import { LOGGER as Logger } from "@requestly/utils";
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
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import {
  trackMockImportClicked,
  trackMockStarToggledEvent,
  trackMockUploadWorkflowStarted,
  trackNewMockButtonClicked,
} from "modules/analytics/events/features/mocksV2";
import { useLocation, useNavigate } from "react-router-dom";
import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import { isMock, isCollection } from "../screens/mocksList/components/MocksList/components/MocksTable/utils";
import { updateMocksCollection } from "backend/mocks/updateMocksCollection";
import { DEFAULT_COLLECTION_ID, DEFAULT_COLLECTION_PATH } from "../constants";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { RBAC, useRBAC } from "features/rbac";
import { ImporterType } from "components/Home/types";
import { SOURCE } from "modules/analytics/events/common/constants";

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
  const { state } = useLocation();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("mock_api", "create");

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

  const showReadOnlyWarning = useCallback(() => {
    toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.update, "mock"), 5);
  }, [getRBACValidationFailureErrorMessage]);

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

      updateMock(uid, record.id, { ...record, isFavourite: updatedValue }, activeWorkspaceId).then(() => {
        trackMockStarToggledEvent(record.id, record.type, record?.fileType, updatedValue, record.recordType);
        toast.success(isStarred ? `${recordType} unstarred!` : `${recordType} starred!`);
        onSuccess?.();
      });
    },
    [activeWorkspaceId, uid]
  );

  const uploadMockAction = useCallback(
    (mockType: MockType) => {
      Logger.log("[DEBUG]", "uploadMockAction", { mockType });
      if (!isValidPermission) {
        showReadOnlyWarning();
        return;
      }

      trackMockUploadWorkflowStarted(mockType);
      openMockUploaderModalAction(mockType);
    },
    [isValidPermission, showReadOnlyWarning, openMockUploaderModalAction]
  );

  const createNewFileAction = useCallback(() => {
    Logger.log("[DEBUG]", "createNewFileAction", {});
    openNewFileModalAction();
  }, [openNewFileModalAction]);

  const createNewMockAction = useCallback(
    (type: MockType, source: MockListSource, collectionId: string = "") => {
      Logger.log("[DEBUG]", "createNewMockAction", { source, type });

      if (!isValidPermission) {
        showReadOnlyWarning();
        return;
      }

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
    [isValidPermission, showReadOnlyWarning, openNewFileModalAction, navigate]
  );

  const removeMocksFromCollectionAction = useCallback(
    async (records: RQMockMetadataSchema[], onSuccess?: () => void) => {
      Logger.log("[DEBUG]", "removeMocksFromCollectionAction", { records });
      const mockIds = records.filter(isMock).map((mock) => mock.id);

      updateMocksCollection(uid, mockIds, DEFAULT_COLLECTION_ID, DEFAULT_COLLECTION_PATH, activeWorkspaceId).then(
        () => {
          toast.success(`${mockIds.length > 1 ? "Mocks" : "Mock"} removed from collection!`);
          onSuccess?.();
        }
      );
    },
    [uid, activeWorkspaceId]
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

      if (!isValidPermission) {
        showReadOnlyWarning();
        return;
      }

      trackMockImportClicked(mockType, source);
      openMocksImportModalAction(mockType, source, onSuccess);
    },
    [isValidPermission, showReadOnlyWarning, openMocksImportModalAction]
  );

  // FIXME: this is buggy, to be fixed later
  useEffect(() => {
    if (state?.modal === ImporterType.FILES) {
      importMocksAction(MockType.API, SOURCE.HOME_SCREEN);
    }
  }, [state?.modal, importMocksAction]);

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
