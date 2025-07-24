import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { RQAPI } from "../types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "../screens/apiClient/historyStore";
import {
  trackNewEnvironmentClicked,
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { createBlankApiRecord, isApiCollection } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { ApiClientRecordsInterface } from "../helpers/modules/sync/interfaces";
import { notification } from "antd";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { debounce } from "lodash";
import { variablesActions } from "store/features/variables/slice";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "../screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "../screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";

interface ApiClientContextInterface {
  onSaveRecord: (apiClientRecord: RQAPI.ApiClientRecord, onSaveTabAction?: "open") => void;
  onSaveBulkRecords: (apiClientRecords: RQAPI.ApiClientRecord[]) => void;
  recordsToBeDeleted: RQAPI.ApiClientRecord[];
  updateRecordsToBeDeleted: (apiClientRecord: RQAPI.ApiClientRecord[]) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteModalClose: () => void;

  history: RQAPI.ApiEntry[];
  addToHistory: (apiEntry: RQAPI.ApiEntry) => void;
  clearHistory: () => void;

  isRecordBeingCreated: RQAPI.RecordType | null;
  setIsRecordBeingCreated: (recordType: RQAPI.RecordType | null) => void;

  isImportModalOpen: boolean;

  selectedHistoryIndex: number;
  setCurrentHistoryIndex: (index: number) => void;
  onImportClick: () => void;
  onImportRequestModalClose: () => void;
  onNewClick: (
    analyticEventSource: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise<void>;

  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiClientWorkloadManager: APIClientWorkloadManager;
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<any, any>>;

  forceRefreshApiClientRecords: () => Promise<boolean>;
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  onSaveRecord: (apiClientRecord: RQAPI.ApiClientRecord, onSaveTabAction?: "open") => {},
  onSaveBulkRecords: (apiClientRecords: RQAPI.ApiClientRecord[]) => {},
  recordsToBeDeleted: null,
  updateRecordsToBeDeleted: (apiClientRecord: RQAPI.ApiClientRecord[]) => {},
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: () => {},
  onDeleteModalClose: () => {},
  history: [],
  addToHistory: (apiEntry: RQAPI.ApiEntry) => {},
  clearHistory: () => {},

  isRecordBeingCreated: null,
  setIsRecordBeingCreated: (recordType: RQAPI.RecordType | null) => {},

  isImportModalOpen: false,

  selectedHistoryIndex: 0,
  setCurrentHistoryIndex: (index: number) => {},
  onImportClick: () => {},
  onImportRequestModalClose: () => {},
  onNewClick: (
    analyticEventSource: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise.resolve(),

  setIsImportModalOpen: () => {},

  apiClientWorkloadManager: new APIClientWorkloadManager(),
  apiClientRecordsRepository: null,

  forceRefreshApiClientRecords: async () => false,
});

interface ApiClientProviderProps {
  children: ReactNode;
  repository: ApiClientRecordsInterface<Record<any, any>>;
}

const trackUserProperties = (records: RQAPI.ApiClientRecord[]) => {
  const totalCollections = records.filter((record) => isApiCollection(record)).length;
  const totalRequests = records.length - totalCollections;
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_COLLECTIONS, totalCollections);
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_REQUESTS, totalRequests);
};

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children, repository }) => {
  const dispatch = useDispatch();
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [
    apiClientRecords,
    addNewRecord,
    updateRecord,
    updateRecords,
    refreshRecords,
    setErroredRecords,
    getData,
  ] = useAPIRecords((state) => [
    state.apiClientRecords,
    state.addNewRecord,
    state.updateRecord,
    state.updateRecords,
    state.refresh,
    state.setErroredRecords,
    state.getData,
  ]);

  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<RQAPI.ApiClientRecord[]>();
  const [history, setHistory] = useState<RQAPI.ApiEntry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const debouncedTrackUserProperties = debounce(() => trackUserProperties(apiClientRecords), 1000);
  const { addNewEnvironment } = useEnvironmentManager();

  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const openDraftRequest = useCallback(
    (apiEntryType?: RQAPI.ApiEntryType) => {
      openTab(new DraftRequestContainerTabSource(apiEntryType));
    },
    [openTab]
  );

  // TODO: Create modal context
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    debouncedTrackUserProperties();
  }, [apiClientRecords, debouncedTrackUserProperties]);

  const onSaveBulkRecords = useCallback(
    (records: RQAPI.ApiClientRecord[]) => {
      updateRecords(records);
    },
    [updateRecords]
  );

  const onSaveRecord: ApiClientContextInterface["onSaveRecord"] = useCallback(
    (apiClientRecord, onSaveTabAction) => {
      const recordId = apiClientRecord.id;

      const doesRecordExist = !!getData(recordId);

      if (doesRecordExist) {
        updateRecord(apiClientRecord);
      } else {
        addNewRecord(apiClientRecord);
      }

      if (onSaveTabAction === "open") {
        if (apiClientRecord.type === RQAPI.RecordType.API) {
          openTab(
            new RequestViewTabSource({ id: recordId, apiEntryDetails: apiClientRecord, title: apiClientRecord.name })
          );
          return;
        }

        if (apiClientRecord.type === RQAPI.RecordType.COLLECTION) {
          openTab(
            new CollectionViewTabSource({
              id: recordId,
              title: apiClientRecord.name,
              focusBreadcrumb: !doesRecordExist,
            })
          );
          return;
        }
      }
    },
    [getData, updateRecord, addNewRecord, openTab]
  );

  const updateRecordsToBeDeleted = useCallback((record: RQAPI.ApiClientRecord[]) => {
    setRecordsToBeDeleted(record);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRecordsToBeDeleted(null);
  }, []);

  const addToHistory = useCallback((apiEntry: RQAPI.ApiEntry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStore();
    trackHistoryCleared();
  }, []);

  const setCurrentHistoryIndex = useCallback((index: number) => {
    setSelectedHistoryIndex(index);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onImportRequestModalClose = useCallback(() => setIsImportModalOpen(false), []);

  const onNewClick = useCallback(
    async (
      analyticEventSource: RQAPI.AnalyticsEventSource,
      recordType: RQAPI.RecordType,
      collectionId = "",
      entryType?: RQAPI.ApiEntryType
    ) => {
      if (!isValidPermission) {
        toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, recordType), 5);
        return;
      }

      switch (recordType) {
        case RQAPI.RecordType.API: {
          trackNewRequestClicked(analyticEventSource);

          if (["api_client_sidebar_header", "home_screen"].includes(analyticEventSource)) {
            openDraftRequest(entryType);
            return;
          }

          setIsRecordBeingCreated(recordType);
          return createBlankApiRecord(recordType, collectionId, repository).then((result) => {
            setIsRecordBeingCreated(null);
            onSaveRecord(result.data, "open");
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(recordType, collectionId, repository)
            .then((result) => {
              setIsRecordBeingCreated(null);
              if (result.success) {
                onSaveRecord(result.data, "open");
                dispatch(variablesActions.updateCollectionVariables({ collectionId: result.data.id, variables: {} }));
              } else {
                toast.error(result.message || "Could not create collection.", 5);
                notification.error({
                  message: "Could not create collection!",
                  description: result?.message,
                  placement: "bottomRight",
                });
              }
            })
            .catch((error) => {
              notification.error({
                message: "Could not create collection!",
                description: error.message,
                placement: "bottomRight",
              });
              console.error("Error adding new collection", error);
            });
        }

        case RQAPI.RecordType.ENVIRONMENT: {
          setIsRecordBeingCreated(recordType);
          trackNewEnvironmentClicked();
          return addNewEnvironment("New Environment")
            .then((newEnvironment: { id: string; name: string }) => {
              setIsRecordBeingCreated(null);
              openTab(
                new EnvironmentViewTabSource({
                  id: newEnvironment.id,
                  title: newEnvironment.name,
                  focusBreadcrumb: true,
                })
              );
            })
            .catch((error) => {
              console.error("Error adding new environment", error);
            });
        }

        default: {
          return;
        }
      }
    },
    [
      repository,
      openDraftRequest,
      onSaveRecord,
      dispatch,
      addNewEnvironment,
      openTab,
      getRBACValidationFailureErrorMessage,
      isValidPermission,
    ]
  );

  const forceRefreshApiClientRecords = useCallback(async () => {
    const recordsToRefresh = await repository.getRecordsForForceRefresh();
    if (!recordsToRefresh || !recordsToRefresh.success) {
      return false;
    }
    refreshRecords(recordsToRefresh.data.records);
    setErroredRecords(recordsToRefresh.data.erroredRecords);
    return true;
  }, [repository, refreshRecords, setErroredRecords]);

  const workloadManager = useMemo(() => new APIClientWorkloadManager(), []);

  const value = {
    onSaveRecord,
    onSaveBulkRecords,
    recordsToBeDeleted,
    updateRecordsToBeDeleted,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    onDeleteModalClose,
    history,
    addToHistory,
    clearHistory,
    setCurrentHistoryIndex,
    selectedHistoryIndex,

    isImportModalOpen,
    setIsImportModalOpen,

    isRecordBeingCreated,
    setIsRecordBeingCreated,

    onImportClick,
    onImportRequestModalClose,
    onNewClick,
    apiClientWorkloadManager: workloadManager,
    apiClientRecordsRepository: repository,
    forceRefreshApiClientRecords,
  };

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = () => useContext(ApiClientContext);
