import { create } from "zustand";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";

export type RunConfigState = {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];

  // advance config
  // persistResponses: boolean;
  // turnOfflogs: boolean;
  // runWithoutStoredCookies: boolean;

  /**
   * This would be used when request reorder happens.
   */
  setRunOrder(runOrder: RunConfigState["runOrder"]): void;
  setDelay(delay: RunConfigState["delay"]): void;
  setIterations(iterations: RunConfigState["iterations"]): void;
  getConfigToSave(): Partial<RunConfigState>;

  /**
   * This would be called when a new request is added by the user.
   * They could add to the collection we are dealing with, or to a child collection.
   */
  patchRunOrder(requests: RQAPI.ApiClientRecord[]): void;
};

function isValidNumber(number: unknown) {
  return Number.isFinite(number) && Number.isInteger(number);
}

export function createRunConfigStore(data: {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];
}) {
  const { id, runOrder, delay = 0, iterations = 1 } = data;

  return create<RunConfigState>()((set, get) => ({
    id,
    runOrder,
    delay,
    iterations,

    setRunOrder(runOrder) {
      set({ runOrder });
    },

    setDelay(delay) {
      const isValid = isValidNumber(delay) && delay >= 0;

      if (!isValid) {
        throw new NativeError("Delay must be a non-negative integer").addContext({ delay });
      }

      set({ delay });
    },

    setIterations(iterations) {
      const isValid = isValidNumber(iterations) && iterations > 0;

      if (!isValid) {
        throw new NativeError("Iterations must be a positive integer").addContext({ iterations });
      }

      set({ iterations });
    },

    getConfigToSave() {
      const { runOrder } = get();
      return { runOrder };
    },

    patchRunOrder(requests) {
      const { runOrder, setRunOrder } = get();

      const ids = requests.map((r) => r.id);
      const incomingRequestSet = new Set(ids);

      // remove stale ids from existing order
      const filteredRunOrder = runOrder.filter((id) => incomingRequestSet.has(id));

      const filteredRunOrderSet = new Set(filteredRunOrder);
      const patch = [];
      for (const request of requests) {
        if (!filteredRunOrderSet.has(request.id)) {
          patch.push(request.id);
        }
      }

      const newRunOrder = [...filteredRunOrder, ...patch];
      setRunOrder(newRunOrder);
    },
  }));
}
