import { create } from "zustand";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";

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
  getConfigToSave(): SavedRunConfig;

  /**
   * This would be called when a new request is added by the user.
   * They could add to the collection we are dealing with, or to a child collection.
   */
  patchOrderedRequests(requests: RQAPI.ApiRecord[]): void;
};

function isValidNumber(number: unknown) {
  return Number.isFinite(number) && Number.isInteger(number);
}

export function createRunConfigStore(data: {
  id: RQAPI.RunConfig["id"];
  orderedRequests: RQAPI.RunConfig["orderedRequests"];
  delay?: RQAPI.RunConfig["delay"];
  iterations?: RQAPI.RunConfig["iterations"];
}) {
  const { id, orderedRequests, delay = 0, iterations = 1 } = data;

  return create<RunConfigState>()((set, get) => ({
    id,
    orderedRequests,
    delay,
    iterations,

    setOrderedRequests(requests) {
      set({ orderedRequests: requests });
    },

    setDelay(delay) {
      // TODO: add upper limit
      const isValid = isValidNumber(delay) && delay >= 0;

      if (!isValid) {
        throw new NativeError("Delay must be a non-negative integer").addContext({ delay });
      }

      set({ delay });
    },

    setIterations(iterations) {
      // TODO: add upper limit
      const isValid = isValidNumber(iterations) && iterations > 0;

      if (!isValid) {
        throw new NativeError("Iterations must be a positive integer").addContext({ iterations });
      }

      set({ iterations });
    },

    getConfigToSave() {
      const { id, orderedRequests } = get();
      const runOrder = orderedRequests.map((r) => r.id);
      return { id, runOrder };
    },

    patchOrderedRequests(requests) {
      const { orderedRequests, setOrderedRequests } = get();

      const ids = requests.map((r) => r.id);
      const incomingRequestSet = new Set(ids);

      // remove stale ids from existing order
      const filteredRunOrder = orderedRequests.filter((r) => incomingRequestSet.has(r.id));
      const filteredRunOrderIds = filteredRunOrder.map((r) => r.id);

      const filteredRunOrderSet = new Set(filteredRunOrderIds);
      const patch = [];
      for (const request of requests) {
        if (!filteredRunOrderSet.has(request.id)) {
          patch.push(request);
        }
      }

      const newOrder = [...filteredRunOrder, ...patch];
      setOrderedRequests(newOrder);
    },
  }));
}
