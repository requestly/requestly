import { SavedRunConfigRecord } from "features/apiClient/commands/collectionRunner/types";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { RQAPI } from "features/apiClient/types";

export namespace LocalStore {
  export type CollectionRecord = RQAPI.CollectionRecord & {
    runConfigs?: Record<SavedRunConfigRecord["id"], SavedRunConfigRecord>;
    runResults?: RunResult[];
  };
}
