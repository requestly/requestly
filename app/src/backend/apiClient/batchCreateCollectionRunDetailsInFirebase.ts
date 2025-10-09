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
): Promise<RQAPI.RecordsPromise> => {
  const result = await batchCreateInFirebase(details);
  return result;
};

const batchCreateInFirebase = async (
  details: {
    collectionId: RQAPI.CollectionRecord["id"];
    runConfigs?: Record<string, SavedRunConfig>;
    runResults?: RunResult[];
  }[]
): Promise<RQAPI.RecordsPromise> => {
  try {
    details.forEach((record) => {
      const { runConfigs = {}, runResults = [], collectionId } = record;

      Object.values(runConfigs).forEach(async (runConfig) => {
        await upsertRunConfig(collectionId, runConfig);
      });

      runResults.forEach(async (runResult) => {
        await addRunResult(collectionId, runResult);
      });
    });

    return { success: true, data: null };
  } catch (error) {
    captureException(error);
    return { success: false, data: null, message: error?.message };
  }
};
