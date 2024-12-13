import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "../types";
import { getApiRecords, upsertApiRecord } from "backend/apiClient";
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
import { useLocation } from "react-router-dom";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { getEmptyAPIEntry } from "../screens/apiClient/utils";

interface ApiClientContextInterface {
  apiClientRecords: RQAPI.Record[];
  isLoadingApiClientRecords: boolean;
  onNewRecord: (apiClientRecord: RQAPI.Record) => void;
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => void;
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => void;
  onSaveRecord: (apiClientRecord: RQAPI.Record) => void;
  onDeleteRecords: (ids: RQAPI.Record["id"][]) => void;
  recordToBeDeleted: RQAPI.Record;
  updateRecordToBeDeleted: (apiClientRecord: RQAPI.Record) => void;
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
}

const ApiClientContext = createContext<ApiClientContextInterface>({
  apiClientRecords: [],
  isLoadingApiClientRecords: false,
  onNewRecord: (apiClientRecord: RQAPI.Record) => {},
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => {},
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => {},
  onSaveRecord: (apiClientRecord: RQAPI.Record) => {},
  onDeleteRecords: (ids: RQAPI.Record["id"][]) => {},
  recordToBeDeleted: null,
  updateRecordToBeDeleted: (apiClientRecord: RQAPI.Record) => {},
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
});

interface ApiClientProviderProps {
  children: React.ReactElement;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isLoadingApiClientRecords, setIsLoadingApiClientRecords] = useState(false);
  const [apiClientRecords, setApiClientRecords] = useState<RQAPI.Record[]>([]);
  const [recordToBeDeleted, setRecordToBeDeleted] = useState<RQAPI.Record>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const { openTab, closeTab, updateTab } = useTabsLayoutContext();
  const { addNewEnvironment } = useEnvironmentManager();

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

    setIsLoadingApiClientRecords(true);
    getApiRecords(uid, teamId)
      .then((result) => {
        if (result.success) {
          setApiClientRecords(result.data);
        }
      })
      .catch((error) => {
        setApiClientRecords([]);
        Logger.error("Error loading api records!", error);
      })
      .finally(() => {
        setIsLoadingApiClientRecords(false);
      });
  }, [uid, teamId]);

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
      });
    },
    [updateTab]
  );

  const onDeleteRecords = useCallback(
    (recordIdsToBeDeleted: RQAPI.Record["id"][]) => {
      recordIdsToBeDeleted?.forEach((recordId) => {
        closeTab(recordId);
      });

      setApiClientRecords((prev) => {
        return prev.filter((record) => {
          return !recordIdsToBeDeleted.includes(record.id);
        });
      });
    },
    [closeTab]
  );

  const onSaveRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      const isRecordExist = apiClientRecords.find((record) => record.id === apiClientRecord.id);

      if (isRecordExist) {
        onUpdateRecord(apiClientRecord);
      } else {
        onNewRecord(apiClientRecord);

        if (location.pathname.includes("history")) {
          openTab(apiClientRecord.id, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${apiClientRecord.id}`,
          });
        }
      }
    },
    [apiClientRecords, onUpdateRecord, onNewRecord, openTab, location.pathname]
  );

  const updateRecordToBeDeleted = useCallback((record: RQAPI.Record) => {
    setRecordToBeDeleted(record);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setRecordToBeDeleted(null);
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
          setIsRecordBeingCreated(recordType);
          trackNewRequestClicked(analyticEventSource);
          const newRequest: Partial<RQAPI.Record> = {
            name: "Untitled request",
            type: RQAPI.RecordType.API,
            data: getEmptyAPIEntry(),
            deleted: false,
            collectionId,
          };

          return upsertApiRecord(uid, newRequest, teamId).then((result) => {
            setIsRecordBeingCreated(null);
            onSaveRecord(result.data);
            openTab(result.data.id, {
              title: result.data.name,
              url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${result.data.id}?new`,
            });
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          const newCollection: Partial<RQAPI.CollectionRecord> = {
            name: "New collection",
            type: RQAPI.RecordType.COLLECTION,
            data: { variables: {} },
            deleted: false,
            collectionId,
          };
          return upsertApiRecord(uid, newCollection, teamId)
            .then((result) => {
              setIsRecordBeingCreated(null);
              if (result.success) {
                onSaveRecord(result.data);
                openTab(result.data.id, {
                  title: result.data.name,
                  url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${result.data.id}?new`,
                });
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
            .then((newEnvironment) => {
              setIsRecordBeingCreated(null);
              openTab(newEnvironment.id, {
                title: newEnvironment.name,
                url: `${PATHS.API_CLIENT.ABSOLUTE}/environments/${newEnvironment.id}?new`,
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
    [openTab, addNewEnvironment, teamId, uid, onSaveRecord]
  );

  const value = {
    apiClientRecords,
    isLoadingApiClientRecords,
    onNewRecord,
    onRemoveRecord,
    onUpdateRecord,
    onSaveRecord,
    onDeleteRecords,
    recordToBeDeleted,
    updateRecordToBeDeleted,
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
  };

  return <ApiClientContext.Provider value={value}>{children}</ApiClientContext.Provider>;
};

export const useApiClientContext = () => useContext(ApiClientContext);
