import { create } from "zustand";
import { persist } from "zustand/middleware";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";

export const createSyncServiceStore = () => {
  const syncServiceStore = create<APIClientSyncService.State>()(
    persist(
      (set, get) => ({
        apisSyncStatus: APIClientSyncService.Status.IDLE,
        envsSyncStatus: APIClientSyncService.Status.IDLE,

        setApisSyncStatus: (status) => set({ apisSyncStatus: status }),
        setEnvsSyncStatus: (status) => set({ envsSyncStatus: status }),

        resetSyncStatus: () => {
          set({ apisSyncStatus: APIClientSyncService.Status.IDLE, envsSyncStatus: APIClientSyncService.Status.IDLE });
        },

        syncApis: async (syncRepository) => {
          if (get().apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
            return;
          }

          console.log("syncing apis...");

          set({ apisSyncStatus: APIClientSyncService.Status.SYNCING });

          try {
            const result = await localStoreRepository.apiClientRecordsRepository.getAllRecords();

            await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(result.data.records);

            await localStoreRepository.apiClientRecordsRepository.clear();
            set({ apisSyncStatus: APIClientSyncService.Status.SUCCESS });
            console.log("syncing apis completed...");
          } catch (error) {
            console.log("syncing error::", error);
            Sentry.captureException(error);
            set({ apisSyncStatus: APIClientSyncService.Status.ERROR });
          }
        },

        syncEnvs: async (syncRepository) => {
          if (get().envsSyncStatus === APIClientSyncService.Status.SUCCESS) {
            return;
          }

          console.log("syncing envs...");

          set({ envsSyncStatus: APIClientSyncService.Status.SYNCING });

          try {
            const result = await localStoreRepository.environmentVariablesRepository.getAllEnvironments();

            await syncRepository.environmentVariablesRepository.createEnvironments(
              Object.values(result.data.environments)
            );

            await localStoreRepository.environmentVariablesRepository.clear();
            set({ envsSyncStatus: APIClientSyncService.Status.SUCCESS });
            console.log("syncing envs completed...");
          } catch (error) {
            console.log("syncing envs error::", error);
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
            console.log("syncing already completed...");
            return;
          }

          await Promise.allSettled([get().syncApis(syncRepository), get().syncEnvs(syncRepository)]);
          console.log("syncing all completed...");

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
