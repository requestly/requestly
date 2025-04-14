import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "../types";
import Logger from "lib/logger";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "../screens/apiClient/historyStore";
import {
  trackNewEnvironmentClicked,
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { clearExpandedRecordIdsFromSession, createBlankApiRecord, isApiCollection } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { useLocation } from "react-router-dom";
import { ApiClientRecordsInterface } from "../helpers/modules/sync/interfaces";
import { useGetApiClientSyncRepo } from "../helpers/modules/sync/useApiClientSyncRepo";
import { notification } from "antd";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { debounce } from "lodash";
import { variablesActions } from "store/features/variables/slice";
import { EnvironmentVariables } from "backend/environment/types";
import { ErroredRecord } from "../helpers/modules/sync/local/services/types";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/clientView/components/DraftRequestContainer/draftRequestContainerTabSource";
import { RequestViewTabSource } from "../screens/apiClient/components/clientView/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/clientView/components/Collection/collectionViewTabSource";
import { EnvironmentViewTabSource } from "../screens/environment/components/environmentView/EnvironmentViewTabSource";

interface ApiClientContextInterface {
  apiClientRecords: RQAPI.Record[];
  errorFiles: ErroredRecord[];
  isLoadingApiClientRecords: boolean;
  onNewRecord: (apiClientRecord: RQAPI.Record) => void;
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => void;
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => void;
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open") => void;
  onSaveBulkRecords: (apiClientRecords: RQAPI.Record[]) => void;
  onDeleteRecords: (ids: RQAPI.Record["id"][]) => void;
  recordsToBeDeleted: RQAPI.Record[];
  updateRecordsToBeDeleted: (apiClientRecord: RQAPI.Record[]) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteModalClose: () => void;

  history: RQAPI.Entry[];
  addToHistory: (apiEntry: RQAPI.Entry) => void;
  clearHistory: () => void;

  isRecordBeingCreated: RQAPI.RecordType | null;
  setIsRecordBeingCreated: (recordType: RQAPI.RecordType | null) => void;

  isImportModalOpen: boolean;

  selectedHistoryIndex: number;
  onSelectionFromHistory: (index: number) => void;
  onImportClick: () => void;
  onImportRequestModalClose: () => void;
  onNewClick: (analyticEventSource: RQAPI.AnalyticsEventSource, recordType?: RQAPI.RecordType) => Promise<void>;

  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiClientWorkloadManager: APIClientWorkloadManager;
  apiClientRecordsRepository: ApiClientRecordsInterface<Record<any, any>>;

  forceRefreshApiClientRecords: () => Promise<boolean>;
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  apiClientRecords: [],
  errorFiles: [],
  isLoadingApiClientRecords: false,
  onNewRecord: (apiClientRecord: RQAPI.Record) => {},
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => {},
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => {},
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open") => {},
  onSaveBulkRecords: (apiClientRecords: RQAPI.Record[]) => {},
  onDeleteRecords: (ids: RQAPI.Record["id"][]) => {},
  recordsToBeDeleted: null,
  updateRecordsToBeDeleted: (apiClientRecord: RQAPI.Record[]) => {},
  isDeleteModalOpen: false,
  setIsDeleteModalOpen: () => {},
  onDeleteModalClose: () => {},
  history: [],
  addToHistory: (apiEntry: RQAPI.Entry) => {},
  clearHistory: () => {},

  isRecordBeingCreated: null,
  setIsRecordBeingCreated: (recordType: RQAPI.RecordType | null) => {},

  isImportModalOpen: false,

  selectedHistoryIndex: 0,
  onSelectionFromHistory: (index: number) => {},
  onImportClick: () => {},
  onImportRequestModalClose: () => {},
  onNewClick: (analyticEventSource: RQAPI.AnalyticsEventSource, recordType?: RQAPI.RecordType) => Promise.resolve(),

  setIsImportModalOpen: () => {},

  apiClientWorkloadManager: new APIClientWorkloadManager(),
  apiClientRecordsRepository: null,

  forceRefreshApiClientRecords: async () => false,
});

interface ApiClientProviderProps {
  children: React.ReactElement;
}

const trackUserProperties = (records: RQAPI.Record[]) => {
  const totalCollections = records.filter((record) => isApiCollection(record)).length;
  const totalRequests = records.length - totalCollections;
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_COLLECTIONS, totalCollections);
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_REQUESTS, totalRequests);
};

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const location = useLocation();
  const [locationState, setLocationState] = useState(location?.state);
  const [isLoadingApiClientRecords, setIsLoadingApiClientRecords] = useState(!!locationState?.action);
  const [apiClientRecords, setApiClientRecords] = useState<RQAPI.Record[]>([]);
  const [errorFiles, setErrorFiles] = useState([]);
  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<RQAPI.Record[]>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const debouncedTrackUserProperties = debounce(() => trackUserProperties(apiClientRecords), 1000);
  const { addNewEnvironment } = useEnvironmentManager();

  const { apiClientRecordsRepository } = useGetApiClientSyncRepo();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const openDraftRequest = useCallback(() => {
    openTab(new DraftRequestContainerTabSource());
  }, [openTab]);

  useEffect(() => {
    if (!user.loggedIn) {
      setApiClientRecords([]);
    }
  }, [user.loggedIn]);

  // TODO: Create modal context
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!uid) {
      return;
    }

    const updateCollectionVariablesOnInit = (records: RQAPI.Record[]) => {
      const collections = records.filter((record) => record.type === RQAPI.RecordType.COLLECTION);
      const collectionVariables: Record<string, { variables: EnvironmentVariables }> = collections.reduce(
        (acc: Record<string, { variables: EnvironmentVariables }>, current: RQAPI.CollectionRecord) => {
          acc[current.id] = {
            variables: current.data.variables || {},
          };
          return acc;
        },
        {}
      );
      dispatch(variablesActions.setCollectionVariables(collectionVariables));
    };

    setIsLoadingApiClientRecords(true);
    apiClientRecordsRepository
      .getAllRecords()
      .then((result) => {
        if (!result.success) {
          notification.error({
            message: "Could not fetch records!",
            description: result.message,
            placement: "bottomRight",
          });
          setApiClientRecords([]);
          return;
        } else {
          setApiClientRecords(result.data.records);
          setErrorFiles(result.data.erroredRecords);
          updateCollectionVariablesOnInit(result.data.records);
        }
      })
      .catch((error) => {
        notification.error({
          message: "Could not fetch records!",
          description: error.message,
          placement: "bottomRight",
        });
        setApiClientRecords([]);
        Logger.error("Error loading api records!", error);
      })
      .finally(() => {
        setIsLoadingApiClientRecords(false);
      });
  }, [apiClientRecordsRepository, uid, dispatch]);

  useEffect(() => {
    debouncedTrackUserProperties();
  }, [apiClientRecords, debouncedTrackUserProperties]);

  const onNewRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => [...prev, { ...apiClientRecord }]);
  }, []);

  const onRemoveRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => prev.filter((record) => record.id !== apiClientRecord.id));
  }, []);

  const onUpdateRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) =>
      prev.map((record) => (record.id === apiClientRecord.id ? { ...record, ...apiClientRecord } : record))
    );
  }, []);

  const onDeleteRecords = useCallback((recordIdsToBeDeleted: RQAPI.Record["id"][]) => {
    clearExpandedRecordIdsFromSession(recordIdsToBeDeleted);

    setApiClientRecords((prev) =>
      prev.filter((record) => {
        return !recordIdsToBeDeleted.includes(record.id);
      })
    );
  }, []);

  const onSaveBulkRecords = useCallback(
    (records: RQAPI.Record[]) => {
      setApiClientRecords((previousRecords: RQAPI.Record[]) => {
        const currentRecordsMap = new Map(previousRecords.map((record) => [record.id, record]));
        records.forEach((record) => {
          currentRecordsMap.set(record.id, record);
        });

        return Array.from(currentRecordsMap.values());
      });
    },
    [setApiClientRecords]
  );

  const onSaveRecord: ApiClientContextInterface["onSaveRecord"] = useCallback(
    (apiClientRecord, onSaveTabAction) => {
      const recordId = apiClientRecord.id;
      const isRecordExist = apiClientRecords.find((record) => record.id === recordId);

      if (isRecordExist) {
        onUpdateRecord(apiClientRecord);
      } else {
        onNewRecord(apiClientRecord);
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
            new CollectionViewTabSource({ id: recordId, title: apiClientRecord.name, focusBreadcrumb: !isRecordExist })
          );
          return;
        }
      }
    },
    [apiClientRecords, onUpdateRecord, onNewRecord, openTab]
  );

  const updateRecordsToBeDeleted = useCallback((record: RQAPI.Record[]) => {
    setRecordsToBeDeleted(record);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRecordsToBeDeleted(null);
  }, []);

  const addToHistory = useCallback((apiEntry: RQAPI.Entry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryFromStore();
    trackHistoryCleared();
  }, []);

  const onSelectionFromHistory = useCallback((index: number) => {
    setSelectedHistoryIndex(index);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onImportRequestModalClose = useCallback(() => setIsImportModalOpen(false), []);

  const onNewClick = useCallback(
    async (analyticEventSource: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType, collectionId = "") => {
      if (!isValidPermission) {
        toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, recordType), 5);
        return;
      }

      console.log({ recordType });

      switch (recordType) {
        case RQAPI.RecordType.API: {
          trackNewRequestClicked(analyticEventSource);

          if (["api_client_sidebar_header", "home_screen"].includes(analyticEventSource)) {
            openDraftRequest();
            return;
          }

          setIsRecordBeingCreated(recordType);
          return createBlankApiRecord(
            uid,
            activeWorkspaceId,
            recordType,
            collectionId,
            apiClientRecordsRepository
          ).then((result) => {
            setIsRecordBeingCreated(null);
            onSaveRecord(result.data, "open");
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(uid, activeWorkspaceId, recordType, collectionId, apiClientRecordsRepository)
            .then((result) => {
              setIsRecordBeingCreated(null);
              if (result.success) {
                onSaveRecord(result.data, "open");
                dispatch(variablesActions.updateCollectionVariables({ collectionId: result.data.id, variables: {} }));
              } else {
                toast.error(result.message || "Could not create collection.", 5);
              }
            })
            .catch((error) => {
              toast.error(error.message || "Could not create collection.", 5);
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
      uid,
      activeWorkspaceId,
      apiClientRecordsRepository,
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
    const recordsToRefresh = await apiClientRecordsRepository.getRecordsForForceRefresh();
    if (!recordsToRefresh || !recordsToRefresh.success) {
      return false;
    }
    setApiClientRecords(() => recordsToRefresh.data.records);
    setErrorFiles(() => recordsToRefresh.data.erroredRecords);
    return true;
  }, [apiClientRecordsRepository]);

  useEffect(() => {
    if (!isLoadingApiClientRecords) {
      locationState?.action === "create" && onNewClick("home_screen", locationState?.type);
      setLocationState({});
    }
  }, [isLoadingApiClientRecords, locationState?.action, locationState?.type, onNewClick]);

  const workloadManager = useMemo(() => new APIClientWorkloadManager(), []);

  const value = {
    apiClientRecords,
    errorFiles,
    isLoadingApiClientRecords,
    onNewRecord,
    onRemoveRecord,
    onUpdateRecord,
    onSaveRecord,
    onSaveBulkRecords,
    onDeleteRecords,
    recordsToBeDeleted,
    updateRecordsToBeDeleted,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    onDeleteModalClose,
    history,
    addToHistory,
    clearHistory,
    onSelectionFromHistory,
    selectedHistoryIndex,

    isImportModalOpen,
    setIsImportModalOpen,

    isRecordBeingCreated,
    setIsRecordBeingCreated,

    onImportClick,
    onImportRequestModalClose,
    onNewClick,
    apiClientWorkloadManager: workloadManager,
    apiClientRecordsRepository,
    forceRefreshApiClientRecords,
  };

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = () => useContext(ApiClientContext);
