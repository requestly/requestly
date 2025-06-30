import { create } from "zustand";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";

export const createSyncServiceStore = () => {
  const syncServiceStore = create<APIClientSyncService.State>((set, get) => ({
    isSyncStatusLoading: false,
    apisSyncStatus: APIClientSyncService.Status.IDLE,
    envsSyncStatus: APIClientSyncService.Status.IDLE,

    resetSyncStatus() {
      set({
        isSyncStatusLoading: false,
        apisSyncStatus: APIClientSyncService.Status.IDLE,
        envsSyncStatus: APIClientSyncService.Status.IDLE,
      });
    },

    async getEntitySyncStatus(respository) {
      try {
        const isEmpty = await respository.getIsAllCleared();
        return isEmpty ? APIClientSyncService.Status.SUCCESS : APIClientSyncService.Status.IDLE;
      } catch (error) {
        return APIClientSyncService.Status.ERROR;
      }
    },

    async updateSyncStatus() {
      const { getEntitySyncStatus } = get();
      set({ isSyncStatusLoading: true });

      const apisSyncStatus = await getEntitySyncStatus(localStoreRepository.apiClientRecordsRepository);
      const envsSyncStatus = await getEntitySyncStatus(localStoreRepository.environmentVariablesRepository);

      console.log("Sync Status Updated:", { apisSyncStatus, envsSyncStatus });

      set({
        apisSyncStatus,
        envsSyncStatus,
        isSyncStatusLoading: false,
      });
    },

    async syncApis(syncRepository) {
      if (get().apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return;
      }

      set({ apisSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.apiClientRecordsRepository.getAllRecords();

        await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(result.data.records);

        await localStoreRepository.apiClientRecordsRepository.clear();
        set({ apisSyncStatus: APIClientSyncService.Status.SUCCESS });
      } catch (error) {
        Sentry.captureException(error);
        set({ apisSyncStatus: APIClientSyncService.Status.ERROR });
      }
    },

    async syncEnvs(syncRepository) {
      if (get().envsSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return;
      }

      set({ envsSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.environmentVariablesRepository.getAllEnvironments();

        await syncRepository.environmentVariablesRepository.createEnvironments(Object.values(result.data.environments));

        await localStoreRepository.environmentVariablesRepository.clear();
        set({ envsSyncStatus: APIClientSyncService.Status.SUCCESS });
      } catch (error) {
        Sentry.captureException(error);
        set({ envsSyncStatus: APIClientSyncService.Status.ERROR });
      }
    },

    async syncAll(syncRepository) {
      const { apisSyncStatus, envsSyncStatus, syncApis, syncEnvs, isSyncStatusLoading, updateSyncStatus } = get();

      if (isSyncStatusLoading) {
        return;
      }

      await updateSyncStatus();

      if (
        apisSyncStatus === APIClientSyncService.Status.SUCCESS &&
        envsSyncStatus === APIClientSyncService.Status.SUCCESS
      ) {
        return;
      }

      await Promise.allSettled([syncApis(syncRepository), syncEnvs(syncRepository)]);
    },
  }));

  return syncServiceStore;
};

export const syncServiceStore = createSyncServiceStore();
