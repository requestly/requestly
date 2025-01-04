import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "../types";
import { getApiRecords } from "backend/apiClient";
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
import { createBlankApiRecord } from "../screens/apiClient/utils";
import useSWR from "swr";

interface ApiClientContextInterface {
  apiClientRecords: RQAPI.Record[];
  isLoadingApiClientRecords: boolean;
  onNewRecord: (apiClientRecord: RQAPI.Record) => void;
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => void;
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => void;
  onSaveRecord: (apiClientRecord: RQAPI.Record, openTabOnSave?: boolean) => void;
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
  onSaveRecord: (apiClientRecord: RQAPI.Record, openTabOnSave?: boolean) => {},
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
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  // const [apiClientRecords, setApiClientRecords] = useState<RQAPI.Record[]>([]);
  const [recordToBeDeleted, setRecordToBeDeleted] = useState<RQAPI.Record>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const { openTab, deleteTabs, updateTab, replaceTab } = useTabsLayoutContext();
  const { addNewEnvironment } = useEnvironmentManager();

  // TODO: Create modal context
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { mutate, error, isLoading, data: apiClientRecords = [] } = useSWR("getApiRecords", () =>
    getApiRecords(uid, teamId).then((res) => res.data)
  );

  useEffect(() => {
    if (!user.loggedIn) {
      mutate([]);
    }
  }, [user.loggedIn, mutate]);

  // useEffect(() => {
  //   if (!uid) {
  //     return;
  //   }

  //   setIsLoadingApiClientRecords(true);
  //   getApiRecords(uid, teamId)
  //     .then((result) => {
  //       if (result.success) {
  //         setApiClientRecords(result.data);
  //       }
  //     })
  //     .catch((error) => {
  //       setApiClientRecords([]);
  //       Logger.error("Error loading api records!", error);
  //     })
  //     .finally(() => {
  //       setIsLoadingApiClientRecords(false);
  //     });
  // }, [uid, teamId]);

  const onNewRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      mutate([...apiClientRecords, apiClientRecord]);
    },
    [apiClientRecords, mutate]
  );

  const onRemoveRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      mutate(apiClientRecords.filter((record) => record.id !== apiClientRecord.id));
    },
    [apiClientRecords, mutate]
  );

  const onUpdateRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      mutate(
        apiClientRecords.map((record) =>
          record.id === apiClientRecord.id ? { ...record, ...apiClientRecord } : record
        )
      );

      updateTab(apiClientRecord.id, {
        title: apiClientRecord.name,
        hasUnsavedChanges: false,
      });
    },
    [updateTab, apiClientRecords, mutate]
  );

  const onDeleteRecords = useCallback(
    (recordIdsToBeDeleted: RQAPI.Record["id"][]) => {
      deleteTabs(recordIdsToBeDeleted);

      mutate(
        apiClientRecords.filter((record) => {
          return !recordIdsToBeDeleted.includes(record.id);
        })
      );
    },
    [deleteTabs, apiClientRecords, mutate]
  );

  const onSaveRecord = useCallback(
    (apiClientRecord: RQAPI.Record, openTabOnSave = true) => {
      const isRecordExist = apiClientRecords.find((record) => record.id === apiClientRecord.id);
      const urlPath = apiClientRecord.type === RQAPI.RecordType.API ? "request" : "collection";
      if (isRecordExist) {
        onUpdateRecord(apiClientRecord);
        replaceTab(apiClientRecord.id, {
          title: apiClientRecord.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${apiClientRecord.id}`,
        });
      } else {
        onNewRecord(apiClientRecord);
        if (openTabOnSave) {
          openTab(apiClientRecord.id, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${apiClientRecord.id}?new`,
          });
        }
      }
    },
    [apiClientRecords, onUpdateRecord, onNewRecord, openTab, replaceTab]
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
          return createBlankApiRecord(uid, teamId, recordType, collectionId).then((result) => {
            setIsRecordBeingCreated(null);
            onSaveRecord(result.data);
          });
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);
          return createBlankApiRecord(uid, teamId, recordType, collectionId)
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
          return (
            addNewEnvironment("New Environment")
              // @ts-ignore
              .then((newEnvironment: { id: string; name: string }) => {
                setIsRecordBeingCreated(null);
                openTab(newEnvironment?.id, {
                  title: newEnvironment?.name,
                  url: `${PATHS.API_CLIENT.ABSOLUTE}/environments/${newEnvironment?.id}?new`,
                });
              })
              .catch((error) => {
                console.error("Error adding new environment", error);
              })
          );
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
    isLoadingApiClientRecords: isLoading,
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
