import { create } from "zustand";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentData } from "backend/environment/types";

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

      set({
        apisSyncStatus,
        envsSyncStatus,
        isSyncStatusLoading: false,
      });
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
      const { apisSyncStatus, envsSyncStatus, syncApis, syncEnvs, isSyncStatusLoading, updateSyncStatus } = get();

      const defaultData = {
        success: true,
        data: {
          records: [] as RQAPI.Record[],
          environments: [] as EnvironmentData[],
        },
      };

      if (isSyncStatusLoading) {
        return defaultData;
      }

      await updateSyncStatus();

      if (
        apisSyncStatus === APIClientSyncService.Status.SUCCESS &&
        envsSyncStatus === APIClientSyncService.Status.SUCCESS
      ) {
        return defaultData;
      }

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
