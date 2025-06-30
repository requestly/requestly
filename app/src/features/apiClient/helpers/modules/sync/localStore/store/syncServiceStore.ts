import { create } from "zustand";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";

export const createSyncServiceStore = () => {
  const syncServiceStore = create<APIClientSyncService.State>((set, get) => ({
    apisSyncStatus: APIClientSyncService.Status.IDLE,
    envsSyncStatus: APIClientSyncService.Status.IDLE,

    resetSyncStatus() {
      set({
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

    async getSyncStatus() {
      const { getEntitySyncStatus } = get();
      const apisSyncStatus = await getEntitySyncStatus(localStoreRepository.apiClientRecordsRepository);
      const envsSyncStatus = await getEntitySyncStatus(localStoreRepository.environmentVariablesRepository);
      return [apisSyncStatus, envsSyncStatus];
    },

    async syncApis(syncRepository) {
      if (get().apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return { success: true, data: [] };
      }

      set({ apisSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.apiClientRecordsRepository.getAllRecords();

        await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(result.data.records);

        await localStoreRepository.apiClientRecordsRepository.clear();
        set({ apisSyncStatus: APIClientSyncService.Status.SUCCESS });

        return { success: true, data: result.data.records };
      } catch (error) {
        Sentry.captureException(error);
        set({ apisSyncStatus: APIClientSyncService.Status.ERROR });
        return { success: true, data: [] };
      }
    },

    async syncEnvs(syncRepository) {
      if (get().envsSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return { success: true, data: [] };
      }

      set({ envsSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.environmentVariablesRepository.getAllEnvironments();

        const environments = await syncRepository.environmentVariablesRepository.createEnvironments(
          Object.values(result.data.environments)
        );

        await localStoreRepository.environmentVariablesRepository.clear();
        set({ envsSyncStatus: APIClientSyncService.Status.SUCCESS });

        return { success: true, data: environments };
      } catch (error) {
        Sentry.captureException(error);
        set({ envsSyncStatus: APIClientSyncService.Status.ERROR });
        return { success: false, data: [] };
      }
    },

    async syncAll(syncRepository) {
      const { syncApis, syncEnvs, getSyncStatus } = get();
      const [apisSyncStatus, envsSyncStatus] = await getSyncStatus();

      if (
        apisSyncStatus === APIClientSyncService.Status.SUCCESS &&
        envsSyncStatus === APIClientSyncService.Status.SUCCESS
      ) {
        return {
          success: true,
          data: {
            records: [] as RQAPI.Record[],
            environments: [] as EnvironmentData[],
          },
        };
      }

      set({ apisSyncStatus, envsSyncStatus });
      const [apis, envs] = await Promise.allSettled([syncApis(syncRepository), syncEnvs(syncRepository)]);
      const records = apis.status === "fulfilled" ? apis.value.data : [];
      const environments = envs.status === "fulfilled" ? envs.value.data : [];

      return {
        success: true,
        data: {
          records,
          environments,
        },
      };
    },
  }));

  return syncServiceStore;
};

export const syncServiceStore = createSyncServiceStore();
