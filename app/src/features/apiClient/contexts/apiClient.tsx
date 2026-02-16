import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { RQAPI } from "../types";
import { addToHistoryInStore, clearHistoryFromStore, getHistoryFromStore } from "../screens/apiClient/historyStore";
import {
  trackNewEnvironmentClicked,
  trackHistoryCleared,
  trackImportCurlClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import { createBlankApiRecord, getEmptyDraftApiRecord } from "../screens/apiClient/utils";
import { APIClientWorkloadManager } from "../helpers/modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { toast } from "utils/Toast";
import { RBAC, useRBAC } from "features/rbac";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { EnvironmentViewTabSource } from "../screens/environment/components/environmentView/EnvironmentViewTabSource";
import { RequestViewTabSource } from "../screens/apiClient/components/views/components/RequestView/requestViewTabSource";
import { CollectionViewTabSource } from "../screens/apiClient/components/views/components/Collection/collectionViewTabSource";
import { createEnvironment, getApiClientFeatureContext } from "../slices";
import { Workspace } from "features/workspaces/types";
import { useTabActions } from "componentsV2/Tabs/slice";
import { saveOrUpdateRecord } from "../hooks/useNewApiClientContext";

interface ApiClientContextInterface {
  history: RQAPI.ApiEntry[];
  addToHistory: (apiEntry: RQAPI.ApiEntry) => void;
  clearHistory: () => void;

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
    contextId: Workspace["id"];
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

// suggestion: could be renamed to ApiClientStoreEnabler
export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const [onNewClickContextId, setOnNewClickContextId] = useState<string | null>(null); // FIXME: temp fix, to be removed

  const [history, setHistory] = useState<RQAPI.ApiEntry[]>(getHistoryFromStore());
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | undefined>(undefined);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRecordBeingCreated, setIsRecordBeingCreated] = useState<RQAPI.RecordType | null>(null);

  const { openBufferedTab } = useTabActions();

  const addToHistory = useCallback((apiEntry: RQAPI.ApiEntry) => {
    setHistory((history) => [...history, apiEntry]);
    addToHistoryInStore(apiEntry);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedHistoryIndex(undefined);
    clearHistoryFromStore();
    trackHistoryCleared();
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
      contextId: Workspace["id"];
      analyticEventSource: RQAPI.AnalyticsEventSource;
      recordType: RQAPI.RecordType;
      collectionId?: string;
      entryType?: RQAPI.ApiEntryType;
    }) => {
      const {
        contextId,
        analyticEventSource,
        recordType,
        collectionId = "",
        entryType = RQAPI.ApiEntryType.HTTP,
      } = params;

      if (!isValidPermission) {
        toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, recordType), 5);
        return;
      }

      setOnNewClickContextId(contextId);
      const context = getApiClientFeatureContext(contextId);
      const { apiClientRecordsRepository, environmentVariablesRepository } = context.repositories;

      switch (recordType) {
        case RQAPI.RecordType.API: {
          trackNewRequestClicked(analyticEventSource);

          if (["api_client_sidebar_header", "home_screen"].includes(analyticEventSource)) {
            openBufferedTab({
              source: new DraftRequestContainerTabSource({
                apiEntryType: entryType,
                context: { id: context.workspaceId },
                emptyRecord: getEmptyDraftApiRecord(entryType),
              }),
              isNew: true,
              preview: false,
            });
            return;
          }

          setIsRecordBeingCreated(recordType);

          try {
            const result = await createBlankApiRecord(recordType, collectionId, apiClientRecordsRepository, entryType);
            setIsRecordBeingCreated(null);
            if (!result.success) {
              toast.error(result.message || "Failed to create record!");
              return;
            }

            saveOrUpdateRecord(context, result.data);

            openBufferedTab({
              isNew: true,
              source: new RequestViewTabSource({
                id: result.data.id,
                apiEntryDetails: result.data as RQAPI.ApiRecord,
                title: result.data.name,
                context: {
                  id: context.workspaceId,
                },
              }),
            });
          } catch (error) {
            toast.error("Failed to create record!");
          }

          return;
        }

        case RQAPI.RecordType.COLLECTION: {
          setIsRecordBeingCreated(recordType);
          trackNewCollectionClicked(analyticEventSource);

          try {
            const result = await createBlankApiRecord(recordType, collectionId, apiClientRecordsRepository);

            setIsRecordBeingCreated(null);
            if (result.success) {
              saveOrUpdateRecord(context, result.data);
              openBufferedTab({
                isNew: true,
                preview: false,
                source: new CollectionViewTabSource({
                  id: result.data.id,
                  title: result.data.name,
                  context: {
                    id: context.workspaceId,
                  },
                }),
              });
            } else {
              toast.error(result.message || "Could not create collection.", 5);
            }
          } catch (error) {
            toast.error("Could not create collection!", 5);
          }
          return;
        }

        case RQAPI.RecordType.ENVIRONMENT: {
          setIsRecordBeingCreated(recordType);
          trackNewEnvironmentClicked("api_client_sidebar_header");

          try {
            const newEnvironment = await context.store
              .dispatch(
                createEnvironment({ name: "New Environment", repository: environmentVariablesRepository }) as any
              )
              .unwrap();

            setIsRecordBeingCreated(null);
            openBufferedTab({
              isNew: true,
              preview: false,
              source: new EnvironmentViewTabSource({
                id: newEnvironment.id,
                title: newEnvironment.name,
                context: {
                  id: context.workspaceId,
                },
                isGlobal: false,
              }),
            });
          } catch (error) {
            setIsRecordBeingCreated(null);
            toast.error(error.message);
          }
          return;
        }

        default: {
          return;
        }
      }
    },
    [isValidPermission, getRBACValidationFailureErrorMessage, openBufferedTab]
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
      return onNewClickV2({
        contextId: context.workspaceId,
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
