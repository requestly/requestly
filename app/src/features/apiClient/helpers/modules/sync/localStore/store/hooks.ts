import { useStore } from "zustand";
import { syncServiceStore } from "./useSyncServiceStore";
import { APIClientSyncService } from "./types";
import { useShallow } from "zustand/shallow";

export const useSyncServiceStore = <T>(selector: (state: APIClientSyncService.State) => T) => {
  return useStore(syncServiceStore, useShallow(selector));
};

export const useIsAllSynced = () => {
  const [apisSyncStatus, envsSyncStatus] = useSyncServiceStore((state) => [state.apisSyncStatus, state.envsSyncStatus]);
  return (
    apisSyncStatus === APIClientSyncService.Status.SUCCESS && envsSyncStatus === APIClientSyncService.Status.SUCCESS
  );
};
