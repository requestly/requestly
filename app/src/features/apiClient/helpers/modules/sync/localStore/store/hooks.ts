import { useStore } from "zustand";
import { syncServiceStore } from "./syncServiceStore";
import { APIClientSyncService } from "./types";
import { useShallow } from "zustand/shallow";

export const useSyncService = <T>(selector: (state: APIClientSyncService.State) => T) => {
  return useStore(syncServiceStore, useShallow(selector));
};
