import { create } from "zustand";
import localStoreRepository from "../ApiClientLocalStorageRepository";
import * as Sentry from "@sentry/react";
import { APIClientSyncService } from "./types";
import { LocalStoreRecordsSync } from "../services/LocalStoreRecordsSync";
import { LocalStoreEnvSync } from "../services/LocalStoreEnvSync";
import { toast } from "utils/Toast";
import { trackLocalStorageSyncStarted } from "modules/analytics/events/features/apiClient";
import { EnvironmentData } from "backend/environment/types";
import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { LocalStore } from "../services/types";
import { NativeError } from "errors/NativeError";

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
    syncTask: null,

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
        const filteredRecords = recordsToSkip
          ? result.data.records.filter((r) => !recordsToSkip.has(r.id))
          : result.data.records;

        const recordsToSync = filteredRecords.map((record) => {
          if (isApiCollection(record)) {
            // runConfigs & runResults are synced separately
            const { runConfigs, runResults, ...rest } = record as LocalStore.CollectionRecord;
            return rest;
          }

          return record;
        });

        const syncResult = await syncRepository.apiClientRecordsRepository.batchCreateRecordsWithExistingId(
          recordsToSync
        );

        if (!syncResult.success) {
          throw new NativeError(syncResult.message ?? "Failed to sync API records!");
        }

        const runDetails = filteredRecords
          .filter((record) => isApiCollection(record))
          .map((record: LocalStore.CollectionRecord) => ({
            collectionId: record.id,
            runConfigs: record.runConfigs ?? {},
            runResults: record.runResults ?? [],
          }));

        const runDetailsSync = await syncRepository.apiClientRecordsRepository.batchCreateCollectionRunDetails(
          runDetails
        );

        if (!runDetailsSync.success) {
          throw new NativeError(`Failed to sync collection run details!`).addContext({
            error: runDetailsSync.message,
          });
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

    async syncGlobalEnv(syncRepository) {
      const allEnvs = await localStoreRepository.environmentVariablesRepository._getAllEnvironments();
      if (!allEnvs.success) {
        throw new NativeError("Could not get all environments!");
      }

      const globalEnvId = localStoreRepository.environmentVariablesRepository.getGlobalEnvironmentId();
      const globalEnv = allEnvs.data.environments[globalEnvId];

      if (!globalEnv) {
        return;
      }

      if (!globalEnv.variables || Object.keys(globalEnv.variables).length === 0) {
        await localStoreRepository.environmentVariablesRepository.deleteEnvironment(globalEnvId);
        return;
      }

      const syncedGlobalEnvId = syncRepository.environmentVariablesRepository.getGlobalEnvironmentId();
      const result = await syncRepository.environmentVariablesRepository.getEnvironmentById(syncedGlobalEnvId);
      const syncedVariables = result.data?.variables ?? {};

      let syncedVariablesCount = Object.values(syncedVariables).length;
      const variablesToBeSynced: EnvironmentData["variables"] = { ...syncedVariables, ...globalEnv.variables };

      // Update id for new variables, it maintains order in table ie appending new variables
      Object.keys(globalEnv.variables).forEach((key) => {
        if (!syncedVariables[key]) {
          variablesToBeSynced[key].id = syncedVariablesCount;
          syncedVariablesCount += 1;
        }
      });

      await syncRepository.environmentVariablesRepository.updateEnvironment(globalEnvId, {
        variables: variablesToBeSynced,
      });

      await localStoreRepository.environmentVariablesRepository.deleteEnvironment(globalEnvId);
    },

    async syncAll(syncRepository, skip) {
      const { syncApis, syncEnvs, updateSyncStatus, syncGlobalEnv } = get();

      await syncGlobalEnv(syncRepository);

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

      trackLocalStorageSyncStarted({ type: "api" });
      toast.loading("Getting your local APIs ready...", 15);

      const [apis, envs] = await Promise.allSettled([
        syncApis(syncRepository, skip?.recordsToSkip),
        syncEnvs(syncRepository, skip?.environmentsToSkip),
      ]);
      const records = apis.status === "fulfilled" ? (apis.value.success ? apis.value.data : []) : [];
      const environments = envs.status === "fulfilled" ? (envs.value.success ? envs.value.data : []) : [];

      if (apis.status === "fulfilled") {
        if (!apis.value.success) {
          throw new NativeError("Not able to sync local APIs");
        }
      }

      if (envs.status === "fulfilled") {
        if (!envs.value.success) {
          throw new NativeError("Not able to sync local Environments");
        }
      }

      return {
        records,
        environments,
      };
    },

    setSyncTask(task) {
      const existingTask = get().syncTask;
      if (task === null) {
        set({
          syncTask: task,
        });

        return;
      }

      if (existingTask) {
        throw new NativeError("Multiple sync tasks started!");
      }

      set({
        syncTask: task,
      });
    },
  }));

  return syncServiceStore;
};

export const syncServiceStore = createSyncServiceStore();
syncServiceStore.getState().updateSyncStatus();
