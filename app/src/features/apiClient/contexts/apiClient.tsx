import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "../types";
import Logger from "lib/logger";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "../screens/apiClient/historyStore";
import {
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import { trackCreateEnvironmentClicked } from "../screens/environment/analytics";
import PATHS from "config/constants/sub/paths";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { clearExpandedRecordIdsFromSession, createBlankApiRecord } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { useSearchParams } from "react-router-dom";
import { RequestTab } from "../screens/apiClient/components/clientView/components/request/components/RequestTabs/RequestTabs";
import { ApiClientRecordsInterface } from "../helpers/modules/sync/interfaces";
import { useGetApiClientSyncRepo } from "../helpers/modules/sync/useApiClientSyncRepo";

interface ApiClientContextInterface {
  apiClientRecords: RQAPI.Record[];
  isLoadingApiClientRecords: boolean;
  onNewRecord: (apiClientRecord: RQAPI.Record) => void;
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => void;
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => void;
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open" | "replace" | "none") => void;
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

  forceRefreshApiClientRecords: (id: string) => Promise<boolean>;
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  apiClientRecords: [],
  isLoadingApiClientRecords: false,
  onNewRecord: (apiClientRecord: RQAPI.Record) => {},
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => {},
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => {},
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open" | "replace" | "none") => {},
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

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [searchParams] = useSearchParams();
  const [isLoadingApiClientRecords, setIsLoadingApiClientRecords] = useState(false);
  const [apiClientRecords, setApiClientRecords] = useState<RQAPI.Record[]>([]);
  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<RQAPI.Record[]>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const { openTab, deleteTabs, updateTab, replaceTab, updateAddTabBtnCallback } = useTabsLayoutContext();
  const { addNewEnvironment } = useEnvironmentManager();

  const { apiClientRecordsRepository } = useGetApiClientSyncRepo();

  const openDraftRequest = useCallback(() => {
    const requestId = apiClientRecordsRepository.generateApiRecordId();

    openTab(requestId, {
      title: "Untitled request",
      url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${encodeURIComponent(requestId)}?create=true`,
    });
  }, [openTab, apiClientRecordsRepository]);

  useEffect(() => {
    if (!user.loggedIn) {
      setApiClientRecords([]);
    }
  }, [user.loggedIn]);

  useEffect(() => {
    if (!user.loggedIn) {
      return;
    }

    updateAddTabBtnCallback(openDraftRequest);
  }, [user.loggedIn, updateAddTabBtnCallback, openDraftRequest]);

  // TODO: Create modal context
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!uid) {
      return;
    }

    setIsLoadingApiClientRecords(true);
    apiClientRecordsRepository
      .getAllRecords()
      .then((result) => {
        setApiClientRecords(result.data);
        // show notification here if success is false
      })
      .catch((error) => {
        setApiClientRecords([]);
        // show notification here
        Logger.error("Error loading api records!", error);
      })
      .finally(() => {
        setIsLoadingApiClientRecords(false);
      });
  }, [apiClientRecordsRepository, uid]);

  const onNewRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => {
      return [...prev, { ...apiClientRecord }];
    });
  }, []);

  const onRemoveRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => {
      return prev.filter((record) => record.id !== apiClientRecord.id);
    });
  }, []);

  const onUpdateRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      setApiClientRecords((prev) => {
        return prev.map((record) => (record.id === apiClientRecord.id ? { ...record, ...apiClientRecord } : record));
      });

      updateTab(apiClientRecord.id, {
        title: apiClientRecord.name,
        hasUnsavedChanges: false,
        isPreview: false,
      });
    },
    [updateTab]
  );

  const onDeleteRecords = useCallback(
    (recordIdsToBeDeleted: RQAPI.Record["id"][]) => {
      deleteTabs(recordIdsToBeDeleted);
      clearExpandedRecordIdsFromSession(recordIdsToBeDeleted);

      setApiClientRecords((prev) => {
        return prev.filter((record) => {
          return !recordIdsToBeDeleted.includes(record.id);
        });
      });
    },
    [deleteTabs]
  );

  const onSaveBulkRecords = useCallback(
    (records: RQAPI.Record[]) => {
      setApiClientRecords((previousRecords: RQAPI.Record[]) => {
        const currentRecordsMap = new Map(previousRecords.map((record) => [record.id, record]));
        records.forEach((record) => {
          if (currentRecordsMap.has(record.id)) {
            updateTab(record.id, {
              title: record.name,
              hasUnsavedChanges: false,
              isPreview: false,
            });
          }
          currentRecordsMap.set(record.id, record);
        });
        return Array.from(currentRecordsMap.values());
      });
    },
    [updateTab, setApiClientRecords]
  );

  const onSaveRecord = useCallback(
    (apiClientRecord: RQAPI.Record, onSaveTabAction: "open" | "replace" | "none" = "open") => {
      console.log("on save", apiClientRecord, onSaveTabAction);
      const recordId = apiClientRecord.id;
      const isRecordExist = apiClientRecords.find((record) => record.id === recordId);
      console.log("on save id", recordId, isRecordExist, apiClientRecords);
      const urlPath = apiClientRecord.type === RQAPI.RecordType.API ? "request" : "collection";
      const requestTab = searchParams.get("tab") || RequestTab.QUERY_PARAMS;

      if (isRecordExist) {
        onUpdateRecord(apiClientRecord);
        replaceTab(recordId, {
          title: apiClientRecord.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${encodeURIComponent(recordId)}?tab=${requestTab}`,
        });
        console.log("called replace tab 1", recordId);
      } else {
        console.log("calling on new");
        onNewRecord(apiClientRecord);

        if (onSaveTabAction === "replace") {
          replaceTab(recordId, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${encodeURIComponent(recordId)}?tab=${requestTab}`,
          });
          console.log("called replace tab 1", recordId);
          return;
        }

        if (onSaveTabAction === "open") {
          openTab(recordId, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${encodeURIComponent(recordId)}?new`,
          });
          return;
        }
      }
    },
    [apiClientRecords, onUpdateRecord, onNewRecord, openTab, replaceTab, searchParams]
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
      switch (recordType) {
        case RQAPI.RecordType.API: {
          trackNewRequestClicked(analyticEventSource);

          if (analyticEventSource === "api_client_sidebar_header") {
            openDraftRequest();
            return;
          }

          setIsRecordBeingCreated(recordType);
          return createBlankApiRecord(uid, teamId, recordType, collectionId, apiClientRecordsRepository).then(
            (result) => {
              setIsRecordBeingCreated(null);
              onSaveRecord(result.data);
            }
          );
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(uid, teamId, recordType, collectionId, apiClientRecordsRepository)
            .then((result) => {
              setIsRecordBeingCreated(null);
              if (result.success) {
                onSaveRecord(result.data);
              }
            })
            .catch((error) => {
              console.error("Error adding new collection", error);
            });
        }

        case RQAPI.RecordType.ENVIRONMENT: {
          setIsRecordBeingCreated(recordType);
          trackCreateEnvironmentClicked(analyticEventSource);
          return addNewEnvironment("New Environment")
            .then((newEnvironment: { id: string; name: string }) => {
              setIsRecordBeingCreated(null);
              openTab(newEnvironment.id, {
                title: newEnvironment.name,
                url: `${PATHS.API_CLIENT.ABSOLUTE}/environments/${encodeURIComponent(newEnvironment.id)}?new`,
              });
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
    [openTab, openDraftRequest, addNewEnvironment, teamId, uid, onSaveRecord, apiClientRecordsRepository]
  );

  const forceRefreshApiClientRecords = useCallback(async () => {
    const recordsToRefresh = await apiClientRecordsRepository.getRecordsForForceRefresh();
    if (!recordsToRefresh || !recordsToRefresh.success) {
      return false;
    }
    setApiClientRecords(() => [...recordsToRefresh.data]);
    return true;
  }, [apiClientRecordsRepository]);

  const workloadManager = useMemo(() => new APIClientWorkloadManager(), []);

  const value = {
    apiClientRecords,
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
