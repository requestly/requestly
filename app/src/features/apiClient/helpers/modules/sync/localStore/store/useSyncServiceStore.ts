import { create } from "zustand";
import { persist } from "zustand/middleware";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";

const initialState: APIClientSyncService.State = {
  apisSyncStatus: APIClientSyncService.Status.IDLE,
  envsSyncStatus: APIClientSyncService.Status.IDLE,
};

export const createSyncServiceStore = () => {
  const syncServiceStore = create<APIClientSyncService.Store>()(
    persist(
      (set, get) => ({
        ...initialState,

        setApisSyncStatus: (status) => set({ apisSyncStatus: status }),
        setEnvsSyncStatus: (status) => set({ envsSyncStatus: status }),

        reset: () => set({ ...initialState }),

        syncApis: async (syncRepository) => {
          if (get().apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
            return;
          }

          set({ apisSyncStatus: APIClientSyncService.Status.SYNCING });

          try {
            const result = await localStoreRepository.apiClientRecordsRepository.getAllRecords();

            await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(result.data.records);

            localStoreRepository.apiClientRecordsRepository.clear();
            set({ apisSyncStatus: APIClientSyncService.Status.SUCCESS });
          } catch (error) {
            Sentry.captureException(error);
            set({ apisSyncStatus: APIClientSyncService.Status.ERROR });
          }
        },

        syncEnvs: async (syncRepository) => {
          if (get().envsSyncStatus === APIClientSyncService.Status.SUCCESS) {
            return;
          }

          set({ envsSyncStatus: APIClientSyncService.Status.SYNCING });

          try {
            const result = await localStoreRepository.environmentVariablesRepository.getAllEnvironments();

            await syncRepository.environmentVariablesRepository.createEnvironments(
              Object.values(result.data.environments)
            );

            localStoreRepository.environmentVariablesRepository.clear();
            set({ envsSyncStatus: APIClientSyncService.Status.SUCCESS });
          } catch (error) {
            Sentry.captureException(error);
            set({ envsSyncStatus: APIClientSyncService.Status.ERROR });
          }
        },

        syncAll: async (syncRepository) => {
          const { apisSyncStatus, envsSyncStatus } = get();
          if (
            apisSyncStatus === APIClientSyncService.Status.SUCCESS &&
            envsSyncStatus === APIClientSyncService.Status.SUCCESS
          ) {
            return;
          }

          await Promise.allSettled([get().syncApis(syncRepository), get().syncEnvs(syncRepository)]);

          return true;
        },
      }),
      {
        name: "apiClientSyncServiceStore:v1",
        partialize: (state) => ({
          apisSyncStatus: state.apisSyncStatus,
          envsSyncStatus: state.envsSyncStatus,
        }),
      }
    )
  );

  return syncServiceStore;
};

export const syncServiceStore = createSyncServiceStore();
