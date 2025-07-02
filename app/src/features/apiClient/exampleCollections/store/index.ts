import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import {
  processRqImportData,
  RQImportData,
} from "features/apiClient/screens/apiClient/components/modals/importModal/utils";
import { create, StoreApi, UseBoundStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { EXAMPLE_COLLECTIONS } from "./constants";
import * as Sentry from "@sentry/react";
import { markAsSample } from "./utils";
import { ApiRecordsState } from "features/apiClient/store/apiRecords/apiRecords.store";

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
            //
            const dataToImport: RQImportData = { records: EXAMPLE_COLLECTIONS.collections.records, environments: [] };
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
              recordsStore.getState().addNewRecords(recordsResult.data.records);
            }

            if (envsResult.length > 0) {
              envsStore.forceRefreshEnvironments();
            }

            set({ importStatus: ExampleCollectionsImportStatus.IMPORTED });
          } catch (error) {
            console.error("Failed to import example collections!", error);
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
