import { useStore } from "zustand";
import { syncServiceStore } from "./useSyncServiceStore";
import { APIClientSyncService } from "./types";

export const useSyncServiceStore = () => useStore(syncServiceStore);

export const useIsAllSynced = () => {
  const { apisSyncStatus, envsSyncStatus } = useSyncServiceStore();
  return (
    apisSyncStatus === APIClientSyncService.Status.SUCCESS && envsSyncStatus === APIClientSyncService.Status.SUCCESS
  );
};
