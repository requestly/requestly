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
import { createBlankApiRecord, isApiCollection } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { notification } from "antd";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { debounce } from "lodash";
import { variablesActions } from "store/features/variables/slice";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { EnvironmentViewTabSource } from "../screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useAPIRecords } from "../store/apiRecords/ApiRecordsContextProvider";
import { useCommand } from "../commands";
import { useContextId } from "./contextId.context";
import { useNewApiClientContext } from "../hooks/useNewApiClientContext";
import { useApiClientFeatureContextProvider } from "../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { useApiClientRepository } from "./meta";

interface ApiClientContextInterface {
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
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},

  isRecordBeingCreated: null,
  setIsRecordBeingCreated: () => {},

  isImportModalOpen: false,

  selectedHistoryIndex: 0,
  setCurrentHistoryIndex: () => {},
  onImportClick: () => {},
  onImportRequestModalClose: () => {},
  onNewClick: () => Promise.resolve(),

  setIsImportModalOpen: () => {},

  apiClientWorkloadManager: new APIClientWorkloadManager(),
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
  const dispatch = useDispatch();
  const { apiClientRecordsRepository: recordsRepository } = useApiClientRepository();
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [apiClientRecords] = useAPIRecords((state) => [
    state.apiClientRecords,
    state.addNewRecord,
    state.updateRecord,
    state.updateRecords,
    state.getData,
  ]);

  const {
    env: { createEnvironment },
  } = useCommand();

  const { onSaveRecord } = useNewApiClientContext();

  const contextId = useContextId();

  const [history, setHistory] = useState<RQAPI.ApiEntry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const debouncedTrackUserProperties = debounce(() => trackUserProperties(apiClientRecords), 1000);

  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const getLastUsedContext = useApiClientFeatureContextProvider((s) => s.getLastUsedContext);

  const openDraftRequest = useCallback(
    (apiEntryType?: RQAPI.ApiEntryType) => {
      openTab(new DraftRequestContainerTabSource({ apiEntryType, context: { id: getLastUsedContext().id } }));
    },
    [openTab, getLastUsedContext]
  );

  useEffect(() => {
    debouncedTrackUserProperties();
  }, [apiClientRecords, debouncedTrackUserProperties]);

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
          return createBlankApiRecord(recordType, collectionId, recordsRepository, entryType).then((result) => {
            setIsRecordBeingCreated(null);
            onSaveRecord(result.data, "open");
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(recordType, collectionId, recordsRepository)
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
          return createEnvironment({ newEnvironmentName: "New Environment" })
            .then((newEnvironment: { id: string; name: string }) => {
              setIsRecordBeingCreated(null);
              openTab(
                new EnvironmentViewTabSource({
                  id: newEnvironment.id,
                  title: newEnvironment.name,
                  focusBreadcrumb: true,
                  context: {
                    id: contextId,
                  },
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
      isValidPermission,
      getRBACValidationFailureErrorMessage,
      recordsRepository,
      openDraftRequest,
      onSaveRecord,
      dispatch,
      createEnvironment,
      openTab,
      contextId,
    ]
  );

  const workloadManager = useMemo(() => new APIClientWorkloadManager(), []);

  const value = {
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
  };

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = () => useContext(ApiClientContext);
