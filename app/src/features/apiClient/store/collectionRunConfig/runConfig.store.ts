import { create } from "zustand";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { ApiClientFile, apiClientFileStore, FileFeature } from "../apiClientFilesStore";

export const DELAY_MAX_LIMIT = 50000; // ms
export const ITERATIONS_MAX_LIMIT = 1000;

export type RunConfigState = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunConfig["runOrder"];
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];
  dataFile: RQAPI.RunConfig["dataFile"];

  /**
   * This would be used when request reorder happens.
   */
  setRunOrder(runOrder: RQAPI.RunConfig["runOrder"]): void;
  setDelay(delay: RunConfigState["delay"]): void;
  setIterations(iterations: RunConfigState["iterations"]): void;
  setDataFile(dataFile: RQAPI.RunConfig["dataFile"]): void;
  removeDataFile(): void;
  getConfig(): RQAPI.RunConfig;
  getConfigToSave(): SavedRunConfig;
  setSelectionForAll(value: boolean): boolean;
  setSelected(id: string, value: boolean): boolean;

  /**
   * This would be called when a new request is added by the user.
   * They could add to the collection we are dealing with, or to a child collection.
   */
  patchRunOrder(requestIds: RQAPI.ApiRecord["id"][]): void;

  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

function isValidNumber(number: unknown) {
  return Number.isFinite(number) && Number.isInteger(number);
}

function parseUnorderedRequests(runOrder: RQAPI.RunOrder, unorderedRequestIds: RQAPI.ApiRecord["id"][]) {
  const orderedRequestIds: RQAPI.RunConfig["runOrder"] = [];

  runOrder.forEach((value) => {
    if (unorderedRequestIds.includes(value.id)) {
      orderedRequestIds.push({ id: value.id, isSelected: value.isSelected });
    }
  });

  return orderedRequestIds;
}

export function createRunConfigStore(data: {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  unorderedRequestIds: RQAPI.ApiRecord["id"][];
  delay?: RQAPI.RunConfig["delay"];
  iterations?: RQAPI.RunConfig["iterations"];
  dataFile?: RQAPI.RunConfig["dataFile"];
}) {
  const { id, runOrder, unorderedRequestIds, delay = 0, iterations = 1, dataFile = null } = data;

  const store = create<RunConfigState>()((set, get) => ({
    id,
    runOrder: parseUnorderedRequests(runOrder, unorderedRequestIds),
    delay,
    iterations,
    hasUnsavedChanges: false,
    dataFile: null,

    setHasUnsavedChanges(hasUnsavedChanges) {
      set({ hasUnsavedChanges });
    },

    setSelectionForAll(value) {
      let didChange = false;
      set({
        runOrder: get().runOrder.map((r) => {
          if (value !== r.isSelected) {
            didChange = true;
          }
          return { ...r, isSelected: value };
        }),
      });

      if (didChange) {
        get().setHasUnsavedChanges(true);
      }

      return didChange;
    },

    setSelected(id, value) {
      let didChange = false;

      set({
        runOrder: get().runOrder.map((r) => {
          if (r.id === id) {
            if (value !== r.isSelected) {
              didChange = true;
            }

            return { ...r, isSelected: value };
          }

          return r;
        }),
      });

      if (didChange) {
        get().setHasUnsavedChanges(true);
      }

      return didChange;
    },

    setRunOrder(runOrder) {
      set({ runOrder, hasUnsavedChanges: true });
    },

    setDelay(delay) {
      const isValid = isValidNumber(delay) && 0 <= delay && delay <= DELAY_MAX_LIMIT;

      if (!isValid) {
        throw new NativeError("Delay must be a non-negative integer").addContext({ delay });
      }

      set({ delay, hasUnsavedChanges: true });
    },

    setIterations(iterations) {
      const isValid = isValidNumber(iterations) && 0 < iterations && iterations <= ITERATIONS_MAX_LIMIT;

      if (!isValid) {
        throw new NativeError("Iterations must be a positive integer").addContext({ iterations });
      }

      set({ iterations, hasUnsavedChanges: true });
    },

    setDataFile(dataFile: RQAPI.RunConfig["dataFile"]) {
      if (!dataFile) {
        return;
      }

      const apiClientFile: Omit<ApiClientFile, "isFileValid"> = {
        name: dataFile.name,
        path: dataFile.path,
        source: dataFile.source,
        size: dataFile.size,
        fileFeature: FileFeature.COLLECTION_RUNNER,
      };
      apiClientFileStore.getState().addFile(dataFile.id, apiClientFile);
      set({ dataFile, hasUnsavedChanges: true });
    },

    removeDataFile() {
      const { dataFile } = get();
      if (dataFile) {
        apiClientFileStore.getState().removeFile(dataFile.id);
      }
      set({ dataFile: null, hasUnsavedChanges: true });
    },

    getConfig() {
      const { id, runOrder, iterations, delay, dataFile } = get();
      return { id, runOrder, iterations, delay, dataFile };
    },

    getConfigToSave() {
      const { id, runOrder, iterations, delay, dataFile } = get();
      return { id, runOrder, iterations, delay, dataFile };
    },

    patchRunOrder(requestIds) {
      const { runOrder, setRunOrder, setHasUnsavedChanges } = get();

      const incomingRequestSet = new Set(requestIds);
      // remove stale ids from existing order
      const filteredRunOrder = runOrder.filter((value) => incomingRequestSet.has(value.id));
      const filteredRunOrderIds = filteredRunOrder.map((value) => value.id);

      const filteredRunOrderSet = new Set(filteredRunOrderIds);
      const patch: RQAPI.RunConfig["runOrder"] = [];
      for (const requestId of requestIds) {
        if (!filteredRunOrderSet.has(requestId)) {
          // Assuming all incoming requests are selected
          patch.push({ id: requestId, isSelected: true });
        }
      }

      const newOrder = [...filteredRunOrder, ...patch];
      setRunOrder(newOrder);
      setHasUnsavedChanges(false);
    },
  }));

  // Initialize dataFile if provided
  if (dataFile) {
    store.getState().setDataFile(dataFile);
    store.getState().setHasUnsavedChanges(false);
  }

  return store;
}
