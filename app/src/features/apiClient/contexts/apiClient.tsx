import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
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
  trackNewTabOpened,
} from "modules/analytics/events/features/apiClient";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { clearExpandedRecordIdsFromSession, createBlankApiRecord, isApiCollection } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { useLocation, useSearchParams } from "react-router-dom";
import { RequestTab } from "../screens/apiClient/components/clientView/components/request/components/RequestTabs/RequestTabs";
import { ApiClientRecordsInterface } from "../helpers/modules/sync/interfaces";
import { useGetApiClientSyncRepo } from "../helpers/modules/sync/useApiClientSyncRepo";
import { notification } from "antd";
import { toast } from "utils/Toast";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { debounce } from "lodash";
import { RBAC, useRBAC } from "features/rbac";

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

  forceRefreshApiClientRecords: () => Promise<boolean>;
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

const trackUserProperties = (records: RQAPI.Record[]) => {
  console.log("Tracking user properties");
  const totalCollections = records.filter((record) => isApiCollection(record)).length;
  const totalRequests = records.length - totalCollections;
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_COLLECTIONS, totalCollections);
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_REQUESTS, totalRequests);
};

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { validatePermission } = useRBAC();
  const permissionValidationResult = validatePermission("api_client_request", "create");

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [locationState, setLocationState] = useState(location?.state);
  const [isLoadingApiClientRecords, setIsLoadingApiClientRecords] = useState(!!locationState?.action);
  const [apiClientRecords, setApiClientRecords] = useState<RQAPI.Record[]>([]);
  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<RQAPI.Record[]>();
  const [history, setHistory] = useState<RQAPI.Entry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState(null);

  const debouncedTrackUserProperties = debounce(() => trackUserProperties(apiClientRecords), 1000);

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

    updateAddTabBtnCallback(() => {
      trackNewTabOpened();
      openDraftRequest();
    });
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
        if (!result.success) {
          notification.error({
            message: "Could not fetch records!",
            description: result.message,
            placement: "bottomRight",
          });
          setApiClientRecords([]);
          return;
        } else {
          setApiClientRecords(result.data);
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
  }, [apiClientRecordsRepository, uid]);

  useEffect(() => {
    debouncedTrackUserProperties();
  }, [apiClientRecords, debouncedTrackUserProperties]);

  const onNewRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => [...prev, { ...apiClientRecord }]);
  }, []);

  const onRemoveRecord = useCallback((apiClientRecord: RQAPI.Record) => {
    setApiClientRecords((prev) => prev.filter((record) => record.id !== apiClientRecord.id));
  }, []);

  const onUpdateRecord = useCallback(
    (apiClientRecord: RQAPI.Record) => {
      setApiClientRecords((prev) =>
        prev.map((record) => (record.id === apiClientRecord.id ? { ...record, ...apiClientRecord } : record))
      );

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

      setApiClientRecords((prev) =>
        prev.filter((record) => {
          return !recordIdsToBeDeleted.includes(record.id);
        })
      );
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

  const isInvalidPermission =
    permissionValidationResult.isValidPermission === false &&
    permissionValidationResult.error === RBAC.Error.not_allowed;

  const onNewClick = useCallback(
    async (analyticEventSource: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType, collectionId = "") => {
      if (isInvalidPermission) {
        toast.warn(
          `As a viewer, you cannot create new ${recordType}. Contact your workspace admin to request an update to your role.`,
          5
        );
        return;
      }

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
    [
      openTab,
      openDraftRequest,
      addNewEnvironment,
      teamId,
      uid,
      onSaveRecord,
      isInvalidPermission,
      apiClientRecordsRepository,
    ]
  );

  const forceRefreshApiClientRecords = useCallback(async () => {
    const recordsToRefresh = await apiClientRecordsRepository.getRecordsForForceRefresh();
    if (!recordsToRefresh || !recordsToRefresh.success) {
      return false;
    }
    setApiClientRecords(() => [...recordsToRefresh.data]);
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
