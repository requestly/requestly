import { RQAPI } from "features/apiClient/types";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { upsertRunConfig } from "./upsertRunConfig";
import { addRunResult } from "./addRunResult";
import { captureException } from "./utils";

export const batchCreateCollectionRunDetailsInFirebase = async (
  details: {
    collectionId: RQAPI.CollectionRecord["id"];
    runConfigs?: Record<string, SavedRunConfig>;
    runResults?: RunResult[];
  }[]
): RQAPI.RecordsPromise => {
  try {
    for (const record of details) {
      const { runConfigs = {}, runResults = [], collectionId } = record;
      const runConfigValues = Object.values(runConfigs);
      if (runConfigValues.length > 0) {
        await Promise.all(runConfigValues.map((runConfig) => upsertRunConfig(collectionId, runConfig)));
      }

      if (runResults.length > 0) {
        await Promise.all(runResults.map((runResult) => addRunResult(collectionId, runResult)));
      }
    }

    return { success: true, data: { records: [], erroredRecords: [] } };
  } catch (error) {
    captureException(error);
    return {
      success: false,
      data: {
        records: [],
        erroredRecords: [],
      },
      message: error?.message,
    };
  }
};
