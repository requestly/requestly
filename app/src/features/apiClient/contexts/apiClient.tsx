import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { generateDocumentId } from "backend/utils";
import { deleteRecord, getAllRecords, getRecordsList, setRecord, setRecords } from "./slice";

interface ApiClientContextInterface {
  apiClientRecords: Record<RQAPI.Record["id"], RQAPI.Record>;
  apiRecordsList: ReadonlyArray<RQAPI.Record>;
  isLoadingApiClientRecords: boolean;
  onNewRecord: (apiClientRecord: RQAPI.Record) => void;
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => void;
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => void;
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open" | "replace" | "none") => void;
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
  apiClientRecords: {},
  apiRecordsList: [],
  isLoadingApiClientRecords: false,
  onNewRecord: (apiClientRecord: RQAPI.Record) => {},
  onRemoveRecord: (apiClientRecord: RQAPI.Record) => {},
  onUpdateRecord: (apiClientRecord: RQAPI.Record) => {},
  onSaveRecord: (apiClientRecord: RQAPI.Record, onSaveTabAction?: "open" | "replace" | "none") => {},
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

  const dispatch = useDispatch();
  const apiClientRecords = useSelector(getAllRecords);
  const apiRecordsList = useSelector(getRecordsList);

  const [isLoadingApiClientRecords, setIsLoadingApiClientRecords] = useState(false);
  // const [apiClientRecords, setApiClientRecords] = useState<Map<RQAPI.Record["id"], RQAPI.Record>>(new Map());
  const [recordToBeDeleted, setRecordToBeDeleted] = useState<RQAPI.Record>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const { openTab, deleteTabs, updateTab, replaceTab } = useTabsLayoutContext();
  const { addNewEnvironment } = useEnvironmentManager();

  useEffect(() => {
    if (!user.loggedIn) {
      dispatch(setRecords({}));
    }
  }, [user.loggedIn, dispatch]);

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
          const recordsMap = result.data.reduce(
            (acc: Record<RQAPI.Record["id"], RQAPI.Record>, record: RQAPI.Record) => {
              acc[record.id] = record;
              return acc;
            },
            {}
          );
          // setApiClientRecords(recordsMap);
          dispatch(setRecords(recordsMap));
        }
      })
      .catch((error) => {
        // setApiClientRecords(new Map());
        dispatch(setRecords({}));
        Logger.error("Error loading api records!", error);
      })
      .finally(() => {
        setIsLoadingApiClientRecords(false);
      });
  }, [uid, teamId, dispatch]);

  // const apiRecordsList = useMemo(() => Array.from(apiClientRecords.values()), [
  //   apiClientRecords,
  // ]) as ReadonlyArray<RQAPI.Record>;

  const onNewRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      // setApiClientRecords((prev) => {
      //   return prev.set(apiClientRecord.id, apiClientRecord);
      // });
      dispatch(setRecord(apiClientRecord));
    },
    [dispatch]
  );

  const onRemoveRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      // setApiClientRecords((prev) => {
      //   prev.delete(apiClientRecord.id);
      //   return prev;
      // });

      dispatch(deleteRecord(apiClientRecord));
    },
    [dispatch]
  );

  const onUpdateRecord = useCallback(
    (updatedRecord: RQAPI.Record) => {
      // setApiClientRecords((prev) => {
      //   prev.set(updatedRecord.id, updatedRecord);
      //   return prev;
      // });

      dispatch(setRecord(updatedRecord));

      updateTab(updatedRecord.id, {
        title: updatedRecord.name,
        hasUnsavedChanges: false,
      });
    },
    [updateTab, dispatch]
  );

  const onDeleteRecords = useCallback(
    (recordIdsToBeDeleted: RQAPI.Record["id"][]) => {
      deleteTabs(recordIdsToBeDeleted);

      // setApiClientRecords((prev) => {
      //   recordIdsToBeDeleted.forEach((id) => {
      //     prev.delete(id);
      //   });
      //   return prev;
      // });
      dispatch(deleteRecord(recordIdsToBeDeleted));
    },

    [deleteTabs, dispatch]
  );

  const onSaveRecord = useCallback(
    (apiClientRecord: RQAPI.Record, onSaveTabAction: "open" | "replace" | "none" = "open") => {
      const existingRecord = apiClientRecords[apiClientRecord.id];
      const urlPath = apiClientRecord.type === RQAPI.RecordType.API ? "request" : "collection";
      if (existingRecord) {
        onUpdateRecord(apiClientRecord);
        replaceTab(apiClientRecord.id, {
          title: apiClientRecord.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${apiClientRecord.id}`,
        });
      } else {
        onNewRecord(apiClientRecord);

        if (onSaveTabAction === "replace") {
          replaceTab(apiClientRecord.id, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${apiClientRecord.id}`,
          });
          return;
        }

        if (onSaveTabAction === "open") {
          openTab(apiClientRecord.id, {
            title: apiClientRecord.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/${urlPath}/${apiClientRecord.id}?new`,
          });
          return;
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

  const openDraftRequest = useCallback(() => {
    const requestId = generateDocumentId("apis");

    openTab(requestId, {
      title: "Untitled request",
      url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${requestId}?create=true`,
    });
  }, [openTab]);

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
          return addNewEnvironment("New Environment")
            .then((newEnvironment: { id: string; name: string; isGlobal: boolean }) => {
              setIsRecordBeingCreated(null);
              openTab(newEnvironment?.id, {
                title: newEnvironment?.name,
                url: `${PATHS.API_CLIENT.ABSOLUTE}/environments/${newEnvironment?.id}?new`,
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
    [openTab, openDraftRequest, addNewEnvironment, teamId, uid, onSaveRecord]
  );

  const value = {
    apiClientRecords,
    apiRecordsList,
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
