import { create } from "zustand";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";
import { LocalStoreRecordsSync } from "../services/LocalStoreRecordsSync";
import { LocalStoreEnvSync } from "../services/LocalStoreEnvSync";
import { toast } from "utils/Toast";

async function getSyncStatus() {
  const apisSyncStatus = await getEntitySyncStatus(localStoreRepository.apiClientRecordsRepository);
  const envsSyncStatus = await getEntitySyncStatus(localStoreRepository.environmentVariablesRepository);
  return [apisSyncStatus, envsSyncStatus];
}

async function getEntitySyncStatus(respository: LocalStoreRecordsSync | LocalStoreEnvSync) {
  try {
    const isEmpty = await respository.getIsAllCleared();
    return isEmpty ? APIClientSyncService.Status.SUCCESS : APIClientSyncService.Status.PENDING_RECORDS;
  } catch (error) {
    return APIClientSyncService.Status.ERROR;
  }
}

export const createSyncServiceStore = () => {
  const syncServiceStore = create<APIClientSyncService.State>((set, get) => ({
    apisSyncStatus: APIClientSyncService.Status.PENDING_RECORDS,
    envsSyncStatus: APIClientSyncService.Status.PENDING_RECORDS,

    async updateSyncStatus() {
      const [apisSyncStatus, envsSyncStatus] = await getSyncStatus();
      set({ apisSyncStatus, envsSyncStatus });
      return {
        apisSyncStatus,
        envsSyncStatus,
      };
    },

    async syncApis(syncRepository, recordsToSkip) {
      if (get().apisSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return { success: true, data: [] };
      }

      set({ apisSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.apiClientRecordsRepository.getAllRecords();
        const recordsToSync = recordsToSkip
          ? result.data.records.filter((r) => !recordsToSkip.has(r.id))
          : result.data.records;

        const syncResult = await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(
          recordsToSync
        );

        if (!syncResult.success) {
          throw new Error(syncResult.message);
        }

        await localStoreRepository.apiClientRecordsRepository.clear();
        set({ apisSyncStatus: APIClientSyncService.Status.SUCCESS });

        return { success: true, data: result.data.records };
      } catch (error) {
        Sentry.captureException(error);
        set({ apisSyncStatus: APIClientSyncService.Status.ERROR });
        return { success: false, error: error.message };
      }
    },

    async syncEnvs(syncRepository, recordsToSkip) {
      if (get().envsSyncStatus === APIClientSyncService.Status.SUCCESS) {
        return { success: true, data: [] };
      }

      set({ envsSyncStatus: APIClientSyncService.Status.SYNCING });

      try {
        const result = await localStoreRepository.environmentVariablesRepository.getAllEnvironments();
        const rawEnvironments = Object.values(result.data.environments);
        const recordsToSync = recordsToSkip ? rawEnvironments.filter((r) => !recordsToSkip.has(r.id)) : rawEnvironments;
        const environments = await syncRepository.environmentVariablesRepository.createEnvironments(recordsToSync);

        await localStoreRepository.environmentVariablesRepository.clear();
        set({ envsSyncStatus: APIClientSyncService.Status.SUCCESS });

        return { success: true, data: environments };
      } catch (error) {
        Sentry.captureException(error);
        set({ envsSyncStatus: APIClientSyncService.Status.ERROR });
        return { success: false, error: error.message };
      }
    },

    async syncAll(syncRepository, skip) {
      const { syncApis, syncEnvs, updateSyncStatus } = get();
      const { apisSyncStatus, envsSyncStatus } = await updateSyncStatus();

      if (
        apisSyncStatus === APIClientSyncService.Status.SUCCESS &&
        envsSyncStatus === APIClientSyncService.Status.SUCCESS
      ) {
        return {
          records: [],
          environments: [],
        };
      }

      toast.loading("Getting your local APIs ready...", 15 * 1000);

      const [apis, envs] = await Promise.allSettled([
        syncApis(syncRepository, skip?.recordsToSkip),
        syncEnvs(syncRepository, skip?.environmentsToSkip),
      ]);
      const records = apis.status === "fulfilled" ? (apis.value.success ? apis.value.data : []) : [];
      const environments = envs.status === "fulfilled" ? (envs.value.success ? envs.value.data : []) : [];

      if (apis.status === "fulfilled") {
        if (!apis.value.success) {
          throw new Error("Not able to sync local APIs");
        }
      }

      if (envs.status === "fulfilled") {
        if (!envs.value.success) {
          throw new Error("Not able to sync local Environments");
        }
      }

      if (apis.status !== "fulfilled" || envs.status !== "fulfilled") {
        throw new Error("Could not sync!");
      }

      return {
        records,
        environments,
      };
    },
  }));

  return syncServiceStore;
};

export const syncServiceStore = createSyncServiceStore();
syncServiceStore.getState().updateSyncStatus();
