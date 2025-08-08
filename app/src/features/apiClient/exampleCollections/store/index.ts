import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import {
  processRqImportData,
  RQImportData,
} from "features/apiClient/screens/apiClient/components/modals/importModal/utils";
import { create, StoreApi, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import * as Sentry from "@sentry/react";
import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";
import exampleCollections from "../examples/collections.json";
import exampleEnvironments from "../examples/environments.json";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { sessionStorage } from "utils/sessionStorage";
import { variablesActions } from "store/features/variables/slice";
import localStoreRepository from "features/apiClient/helpers/modules/sync/localStore/ApiClientLocalStorageRepository";
import { Dispatch } from "react";
import {
  trackExampleCollectionsImported,
  trackExampleCollectionsImportFailed,
} from "modules/analytics/events/features/apiClient";
import { EnvironmentData } from "backend/environment/types";
import { useCommand } from "features/apiClient/commands";

export const EXPANDED_RECORD_IDS_UPDATED = "expandedRecordIdsUpdated";

const markAsExample = <T>(record: T) => ({ ...(record ?? {}), isExample: true } as T);

export enum ExampleCollectionsImportStatus {
  NOT_IMPORTED = "NOT_IMPORTED",
  IMPORTING = "IMPORTING",
  IMPORTED = "IMPORTED",
  FAILED = "FAILED",
}

type ExampleCollectionsState = {
  isNudgePermanentlyClosed: boolean;
  importStatus: ExampleCollectionsImportStatus;
};

type ExampleCollectionsActions = {
  closeNudge: () => void;
  getIsExampleCollectionsImported: () => boolean;
  importExampleCollections: (params: {
    respository: ApiClientRepositoryInterface;
    ownerId: string | null;
    recordsStore: StoreApi<ApiRecordsState>;
    envsStore: {
      createEnvironments: ReturnType<typeof useCommand>["env"]["createEnvironments"];
    };
    dispatch: Dispatch<unknown>;
  }) => Promise<{ success: true } | { success: false; message: string }>;
};

type ExampleCollectionsStore = ExampleCollectionsState & ExampleCollectionsActions;

const initialState: ExampleCollectionsState = {
  isNudgePermanentlyClosed: false,
  importStatus: ExampleCollectionsImportStatus.NOT_IMPORTED,
};

const createExampleCollectionsStore = () => {
  return create<ExampleCollectionsStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        closeNudge: () => {
          set({ isNudgePermanentlyClosed: true });
        },

        getIsExampleCollectionsImported: () => {
          const { importStatus } = get();
          return importStatus === ExampleCollectionsImportStatus.IMPORTED;
        },

        importExampleCollections: async ({ respository, ownerId, recordsStore, envsStore, dispatch }) => {
          const { importStatus, isNudgePermanentlyClosed } = get();

          if (
            [ExampleCollectionsImportStatus.IMPORTING, ExampleCollectionsImportStatus.IMPORTED].includes(importStatus)
          ) {
            return;
          }

          if (isNudgePermanentlyClosed) {
            return;
          }

          set({ importStatus: ExampleCollectionsImportStatus.IMPORTING });

          dispatch(
            variablesActions.setCurrentEnvironment({
              environmentId: localStoreRepository.environmentVariablesRepository.getGlobalEnvironmentId(),
            })
          );

          try {
            const dataToImport = ({
              records: exampleCollections.records,
              environments: exampleEnvironments.environments,
            } as unknown) as RQImportData;

            const proccessedData = processRqImportData(dataToImport, ownerId, respository.apiClientRecordsRepository);
            proccessedData.apis = proccessedData.apis.map((api) => {
              // TODD: Fix this in "processRqImportData" itself
              const newCollectionId = proccessedData.collections.find(
                (collection) => collection.id === api.collectionId
              )?.id;

              const updatedApi = {
                ...api,
                collectionId: newCollectionId,
                id: respository.apiClientRecordsRepository.generateApiRecordId(newCollectionId),
              };

              return markAsExample(updatedApi);
            });

            proccessedData.collections = proccessedData.collections.map((r, index) => {
              if (index === 0) {
                // Mark parent collection as root, this will be use to show special collection icon on UI
                // @ts-ignore
                r["isExampleRoot"] = true;
              }

              return markAsExample(r);
            });
            proccessedData.environments = proccessedData.environments.map((r) => markAsExample(r)) as EnvironmentData[];

            const recordsToImport = [...proccessedData.apis, ...proccessedData.collections];

            // TODO: extract into a command
            const recordsResult = await respository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(
              recordsToImport
            );

            await envsStore.createEnvironments({ environmentsToCreate: proccessedData.environments });

            if (recordsResult.success && recordsResult.data.records.length > 0) {
              const collectionsToBeExpanded = proccessedData.collections.map((collection) => collection.id);
              const existingExpandedCollections = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);

              sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [
                ...existingExpandedCollections,
                ...collectionsToBeExpanded,
              ]);

              const event = new CustomEvent(EXPANDED_RECORD_IDS_UPDATED);
              window.dispatchEvent(event);

              recordsStore.getState().addNewRecords(recordsResult.data.records);
            }

            trackExampleCollectionsImported();

            set({ importStatus: ExampleCollectionsImportStatus.IMPORTED });
            return { success: true };
          } catch (error) {
            Sentry.captureException(error);
            trackExampleCollectionsImportFailed();
            set({ importStatus: ExampleCollectionsImportStatus.FAILED });
            return { success: false, message: "Failed to import example collections" };
          }
        },
      }),
      {
        name: "rqExampleCollectionsStore",
        partialize: (state) => ({
          importStatus: state.importStatus,
          isNudgePermanentlyClosed: state.isNudgePermanentlyClosed,
        }),
      }
    )
  );
};

const exampleCollectionsStore = createExampleCollectionsStore();

export const useExampleCollections = <T>(selector: (state: ExampleCollectionsStore) => T) => {
  return useStore(exampleCollectionsStore, useShallow(selector));
};
