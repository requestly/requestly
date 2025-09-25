import { create } from "zustand";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";

export const DELAY_MAX_LIMIT = 50000; // ms
export const ITERATIONS_MAX_LIMIT = 1000;

export type RunConfigState = {
  id: RQAPI.RunConfig["id"];
  orderedRequests: RQAPI.RunConfig["orderedRequests"];
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];

  /**
   * This would be used when request reorder happens.
   */
  setOrderedRequests(requests: RunConfigState["orderedRequests"]): void;
  setDelay(delay: RunConfigState["delay"]): void;
  setIterations(iterations: RunConfigState["iterations"]): void;
  setSelected(id: string, value: boolean): void;
  getConfig(): RQAPI.RunConfig;
  getConfigToSave(): SavedRunConfig;

  /**
   * This would be called when a new request is added by the user.
   * They could add to the collection we are dealing with, or to a child collection.
   */
  patchOrderedRequests(requests: RQAPI.ApiRecord[]): void;

  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

function isValidNumber(number: unknown) {
  return Number.isFinite(number) && Number.isInteger(number);
}

function parseUnorderedRequests(runOrder: RQAPI.RunOrder, unorderedRequests: RQAPI.ApiRecord[]) {
  const orderedRequests: RQAPI.RunConfig["orderedRequests"] = [];

  runOrder.forEach((value) => {
    const request = unorderedRequests.find((r) => r.id === value.id);
    if (request) {
      orderedRequests.push({ record: request, isSelected: value.isSelected });
    }
  });

  return orderedRequests;
}

export function createRunConfigStore(data: {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  unorderedRequests: RQAPI.ApiRecord[];
  delay?: RQAPI.RunConfig["delay"];
  iterations?: RQAPI.RunConfig["iterations"];
}) {
  const { id, runOrder, unorderedRequests, delay = 0, iterations = 1 } = data;

  return create<RunConfigState>()((set, get) => ({
    id,
    orderedRequests: parseUnorderedRequests(runOrder, unorderedRequests),
    delay,
    iterations,
    hasUnsavedChanges: false,

    setHasUnsavedChanges(hasUnsavedChanges) {
      set({ hasUnsavedChanges });
    },

    setSelected(id, value) {
      set({
        orderedRequests: get().orderedRequests.map((r) => {
          return r.record.id === id ? { record: r.record, isSelected: value } : r;
        }),
      });
    },

    setOrderedRequests(requests) {
      set({ orderedRequests: requests, hasUnsavedChanges: true });
    },

    setDelay(delay) {
      const isValid = isValidNumber(delay) && 0 <= delay && delay <= DELAY_MAX_LIMIT;

      if (!isValid) {
        throw new NativeError("Delay must be a non-negative integer").addContext({ delay });
      }

      set({ delay });
    },

    setIterations(iterations) {
      const isValid = isValidNumber(iterations) && 0 < iterations && iterations <= ITERATIONS_MAX_LIMIT;

      if (!isValid) {
        throw new NativeError("Iterations must be a positive integer").addContext({ iterations });
      }

      set({ iterations });
    },

    getConfig() {
      const { id, orderedRequests, iterations, delay } = get();
      return { id, orderedRequests, iterations, delay };
    },

    getConfigToSave() {
      const { id, orderedRequests } = get();
      const runOrder = orderedRequests.map((r) => ({ id: r.record.id, isSelected: r.isSelected }));
      return { id, runOrder };
    },

    patchOrderedRequests(requests) {
      const { orderedRequests, setOrderedRequests, setHasUnsavedChanges } = get();

      const ids = requests.map((r) => r.id);
      const incomingRequestSet = new Set(ids);

      // remove stale ids from existing order
      const filteredRunOrder = orderedRequests.filter((value) => incomingRequestSet.has(value.record.id));
      const filteredRunOrderIds = filteredRunOrder.map((value) => value.record.id);

      const filteredRunOrderSet = new Set(filteredRunOrderIds);
      const patch: RQAPI.RunConfig["orderedRequests"] = [];
      for (const request of requests) {
        if (!filteredRunOrderSet.has(request.id)) {
          // Assuming all incoming requests are selected
          patch.push({ record: request, isSelected: true });
        }
      }

      const newOrder = [...filteredRunOrder, ...patch];
      setOrderedRequests(newOrder);
      setHasUnsavedChanges(false);
    },
  }));
}
