import { create } from "zustand";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";

type RunConfigState = {
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

export function createRunConfigStore(data: {
  id: RQAPI.RunConfig["id"];
  runOrder: RQAPI.RunOrder;
  delay: RQAPI.RunConfig["delay"];
  iterations: RQAPI.RunConfig["iterations"];
}) {
  const { id, runOrder, delay, iterations } = data;

  return create<RunConfigState>()((set, get) => ({
    id,
    runOrder,
    delay,
    iterations,

    setRunOrder(runOrder) {
      set({ runOrder });
    },

    setDelay(delay) {
      if (delay < 0) {
        throw new NativeError("Delay cannot be negative").addContext({ delay });
      }

      set({ delay });
    },

    setIterations(iterations) {
      if (iterations <= 0) {
        throw new NativeError("Invalid iterations!").addContext({ iterations });
      }

      set({ iterations });
    },

    getConfigToSave() {
      const { id, runOrder, delay, iterations } = get();
      return { id, runOrder, delay, iterations };
    },

    patchRunOrder(requests) {
      const ids = requests.map((r) => r.id);
      get().setRunOrder(ids);
    },
  }));
}
