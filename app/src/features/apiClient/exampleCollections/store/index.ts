import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import {
  processRqImportData,
  RQImportData,
} from "features/apiClient/screens/apiClient/components/modals/importModal/utils";
import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import * as Sentry from "@sentry/react";
import { markAsSample } from "./utils";
import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";
import exampleCollections from "../examples/collections.json";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { sessionStorage } from "utils/sessionStorage";

enum ExampleCollectionsImportStatus {
  NOT_IMPORTED = "NOT_IMPORTED",
  IMPORTING = "IMPORTING",
  IMPORTED = "IMPORTED",
  FAILED = "FAILED",
}

type ExampleCollectionsState = {
  isBannerPermanentlyClosed: boolean;
  importStatus: ExampleCollectionsImportStatus;
};

type ExampleCollectionsActions = {
  getIsImported: () => boolean;
  importExampleCollections: (params: {
    respository: ApiClientRepositoryInterface;
    ownerId: string | null;
    recordsStore: UseBoundStore<StoreApi<ApiRecordsState>>;
    envsStore: {
      forceRefreshEnvironments: () => void;
    };
  }) => Promise<void>;
};

type ExampleCollectionsStore = ExampleCollectionsState & ExampleCollectionsActions;

const initialState: ExampleCollectionsState = {
  isBannerPermanentlyClosed: false,
  importStatus: ExampleCollectionsImportStatus.NOT_IMPORTED,
};

const createExampleCollectionsStore = () => {
  return create<ExampleCollectionsStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        getIsImported: () => {
          const { importStatus } = get();
          return importStatus === ExampleCollectionsImportStatus.IMPORTED;
        },

        importExampleCollections: async ({ respository, ownerId, recordsStore, envsStore }) => {
          const { getIsImported } = get();

          if (getIsImported()) {
            return;
          }

          set({ importStatus: ExampleCollectionsImportStatus.IMPORTING });

          try {
            const dataToImport = ({ records: exampleCollections.records, environments: [] } as unknown) as RQImportData;
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

              return markAsSample(updatedApi);
            });

            proccessedData.collections = proccessedData.collections.map((r) => markAsSample(r));
            proccessedData.environments = proccessedData.environments.map((r) => markAsSample(r));

            const recordsToImport = [...proccessedData.apis, ...proccessedData.collections];
            const recordsResult = await respository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(
              recordsToImport
            );

            const envsResult = await respository.environmentVariablesRepository.createEnvironments(
              proccessedData.environments
            );

            if (recordsResult.success && recordsResult.data.records.length > 0) {
              const collectionsToBeExpanded = proccessedData.collections.map((collection) => collection.id);
              const existingExpandedCollections = sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []);

              sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [
                ...existingExpandedCollections,
                ...collectionsToBeExpanded,
              ]);

              const event = new CustomEvent("expandedRecordIdsUpdated");
              window.dispatchEvent(event);

              recordsStore.getState().addNewRecords(recordsResult.data.records);
            }

            if (envsResult.length > 0) {
              envsStore.forceRefreshEnvironments();
            }

            set({ importStatus: ExampleCollectionsImportStatus.IMPORTED });
          } catch (error) {
            Sentry.captureException(error);
            set({ importStatus: ExampleCollectionsImportStatus.FAILED });
          }
        },
      }),
      {
        name: "rqExampleCollectionsStore",
        partialize: (state) => ({
          importStatus: state.importStatus,
          isBannerPermanentlyClosed: state.isBannerPermanentlyClosed,
        }),
      }
    )
  );
};

const exampleCollectionsStore = createExampleCollectionsStore();

export const useExampleCollections = <T>(selector: (state: ExampleCollectionsStore) => T) => {
  return useStore(exampleCollectionsStore, useShallow(selector));
};
