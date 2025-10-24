import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RQAPI } from "../types";
import { 
  addToHistoryInStore, 
  clearHistoryFromStore,
  deleteHistoryItemFromStore,
  deleteHistoryByDateFromStore,
  getHistoryFromStore,
  HistoryEntry,
} from "../screens/apiClient/historyStore";

import {
  trackNewEnvironmentClicked,
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import { createBlankApiRecord, isApiCollection } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { notification } from "antd";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { debounce } from "lodash";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { EnvironmentViewTabSource } from "../screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { getApiClientFeatureContext, saveOrUpdateRecord } from "../commands/store.utils";
import { RequestViewTabSource } from "../screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { createEnvironment as _createEnvironment } from "../commands/environments";

interface ApiClientContextInterface {
  history: HistoryEntry[];
  addToHistory: (apiEntry: RQAPI.ApiEntry) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  deleteHistoryByDate: (dateKey: string) => void;
  isRecordBeingCreated: RQAPI.RecordType | null;
  setIsRecordBeingCreated: (recordType: RQAPI.RecordType | null) => void;

  isImportModalOpen: boolean;

  selectedHistoryIndex?: number;
  setCurrentHistoryIndex: (index?: number) => void;
  onImportClick: () => void;
  onImportRequestModalClose: () => void;
  onNewClick: (
    analyticEventSource: RQAPI.AnalyticsEventSource,
    recordType: RQAPI.RecordType,
    collectionId?: string,
    entryType?: RQAPI.ApiEntryType
  ) => Promise<void>;
  onNewClickV2: (params: {
    contextId: string;
    analyticEventSource: RQAPI.AnalyticsEventSource;
    recordType: RQAPI.RecordType;
    collectionId?: string;
    entryType?: RQAPI.ApiEntryType;
  }) => Promise<void>;
  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiClientWorkloadManager: APIClientWorkloadManager;
  onNewClickContextId: string | null;
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  deleteHistoryItem: () => {},
  deleteHistoryByDate: () => {},

  isRecordBeingCreated: null,
  setIsRecordBeingCreated: () => {},

  isImportModalOpen: false,

  selectedHistoryIndex: undefined,
  setCurrentHistoryIndex: () => {},
  onImportClick: () => {},
  onImportRequestModalClose: () => {},
  onNewClick: () => Promise.resolve(),
  onNewClickV2: () => Promise.resolve(),

  setIsImportModalOpen: () => {},

  apiClientWorkloadManager: new APIClientWorkloadManager(),
  onNewClickContextId: null,
});

interface ApiClientProviderProps {
  children: ReactNode;
}

const trackUserProperties = (records: RQAPI.ApiClientRecord[]) => {
  const totalCollections = records.filter((record) => isApiCollection(record)).length;
  const totalRequests = records.length - totalCollections;
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_COLLECTIONS, totalCollections);
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_REQUESTS, totalRequests);
};

// suggestion: could be renamed to ApiClientStoreEnabler
export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [apiClientRecords] = useAPIRecords((state) => [
    state.apiClientRecords,
    state.addNewRecord,
    state.updateRecord,
    state.updateRecords,
    state.getData,
  ]);
  const [onNewClickContextId, setOnNewClickContextId] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | undefined>(undefined); 

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState<RQAPI.RecordType | null>(null);


  const debouncedTrackUserProperties = debounce(() => trackUserProperties(apiClientRecords), 1000);

  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  useEffect(() => {
    debouncedTrackUserProperties();
  }, [apiClientRecords, debouncedTrackUserProperties]);

  const addToHistory = useCallback((apiEntry: RQAPI.ApiEntry) => {
    const entryWithMeta: HistoryEntry = {
      ...apiEntry,
      historyId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdTs: Date.now(),
    };
    setHistory((history) => [...history, entryWithMeta]);
    addToHistoryInStore(entryWithMeta);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedHistoryIndex(undefined);
    clearHistoryFromStore();
    trackHistoryCleared();
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prevHistory) => prevHistory.filter((entry) => entry.historyId !== id));
    deleteHistoryItemFromStore(id);
  }, []);

  const deleteHistoryByDate = useCallback((dateKey: string) => {
    setHistory((prevHistory) => {
      return prevHistory.filter((entry) => {
        const entryDate = new Date(entry.createdTs).toISOString().slice(0, 10);
        return entryDate !== dateKey;
      });
    });
    deleteHistoryByDateFromStore(dateKey);
  }, []);

  const setCurrentHistoryIndex = useCallback((index?: number) => {
    setSelectedHistoryIndex(index);
  }, []);

  const onImportClick = useCallback(() => {
    setIsImportModalOpen(true);
    trackImportCurlClicked();
  }, []);

  const onImportRequestModalClose = useCallback(() => setIsImportModalOpen(false), []);

  const onNewClickV2 = useCallback(
    async (params: {
      contextId: string;
      analyticEventSource: RQAPI.AnalyticsEventSource;
      recordType: RQAPI.RecordType;
      collectionId?: string;
      entryType?: RQAPI.ApiEntryType;
    }) => {
      const { contextId, analyticEventSource, recordType, collectionId = "", entryType } = params;

      if (!isValidPermission) {
        toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, recordType), 5);
        return;
      }

      setOnNewClickContextId(contextId);
      const context = getApiClientFeatureContext(contextId);
       if (!context) {
      toast.error("Failed to get API client context");
      return;
    }
      const recordsRepository = context.repositories.apiClientRecordsRepository;

      switch (recordType) {
        case RQAPI.RecordType.API: {
          trackNewRequestClicked(analyticEventSource);

          if (["api_client_sidebar_header", "home_screen"].includes(analyticEventSource)) {
            openTab(new DraftRequestContainerTabSource({ apiEntryType: entryType, context: { id: context.id } }));
            return;
          }

          setIsRecordBeingCreated(recordType);
          return createBlankApiRecord(recordType, collectionId, recordsRepository, entryType).then((result) => {
            setIsRecordBeingCreated(null);
            if (!result.success) {
              toast.error(result.message || "Failed to create record!");
              return;
            }
            saveOrUpdateRecord(context, result.data);

            openTab(
              new RequestViewTabSource({
                id: result.data.id,
                apiEntryDetails: result.data as RQAPI.ApiRecord,
                title: result.data.name,
                context: {
                  id: context.id,
                },
              })
            );
            return;
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(recordType, collectionId, recordsRepository)
            .then((result) => {
              setIsRecordBeingCreated(null);
              if (result.success) {
                saveOrUpdateRecord(context, result.data);
                openTab(
                  new CollectionViewTabSource({
                    id: result.data.id,
                    title: result.data.name,
                    focusBreadcrumb: false,
                    context: {
                      id: context.id,
                    },
                  })
                );
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
          return _createEnvironment(context, { newEnvironmentName: "New Environment" })
            .then((newEnvironment: { id: string; name: string }) => {
              setIsRecordBeingCreated(null);
              openTab(
                new EnvironmentViewTabSource({
                  id: newEnvironment.id,
                  title: newEnvironment.name,
                  focusBreadcrumb: true,
                  context: {
                    id: context.id,
                  },
                })
              );
            })
            .catch((error) => {
              setIsRecordBeingCreated(null);
              toast.error(error.message);
              console.error("Error adding new environment", error);
            });
        }

        default: {
          return;
        }
      }
    },
    [isValidPermission, getRBACValidationFailureErrorMessage, openTab]
  );

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

      const context = getApiClientFeatureContext();
       if (!context) {
      toast.error("Failed to get API client context");
      return;
    }
      return onNewClickV2({
        contextId: context.id,
        analyticEventSource,
        recordType,
        collectionId,
        entryType,
      });
    },
    [isValidPermission, onNewClickV2, getRBACValidationFailureErrorMessage]
  );

  const workloadManager = useMemo(() => new APIClientWorkloadManager(), []);

  const value = {
    history,
    addToHistory,
    clearHistory,
    deleteHistoryItem,
    deleteHistoryByDate,
    setCurrentHistoryIndex,
    selectedHistoryIndex,

    isImportModalOpen,
    setIsImportModalOpen,

    isRecordBeingCreated,
    setIsRecordBeingCreated,

    onImportClick,
    onImportRequestModalClose,
    onNewClick,
    onNewClickV2,
    apiClientWorkloadManager: workloadManager,
    onNewClickContextId,
  };

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = () => useContext(ApiClientContext);
