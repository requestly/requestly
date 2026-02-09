import { RunResult } from "features/apiClient/slices/common/runResults";
import { SavedRunConfigRecord } from "features/apiClient/slices/runConfig/types";
import { RQAPI } from "features/apiClient/types";

export namespace LocalStore {
  export type CollectionRecord = RQAPI.CollectionRecord & {
    runConfigs?: Record<SavedRunConfigRecord["id"], SavedRunConfigRecord>;
    runResults?: RunResult[];
  };
}
