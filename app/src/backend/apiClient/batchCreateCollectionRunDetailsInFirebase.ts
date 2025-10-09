import { RQAPI } from "features/apiClient/types";
import { getOwnerId } from "backend/utils";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { upsertRunConfig } from "./upsertRunConfig";
import { addRunResult } from "./addRunResult";
import { captureException } from "./utils";

export const batchCreateCollectionRunDetailsInFirebase = async (
  uid: string,
  teamId: string,
  details: {
    collectionId: RQAPI.CollectionRecord["id"];
    runConfigs?: Record<string, SavedRunConfig>;
    runResults?: RunResult[];
  }[]
): Promise<RQAPI.RecordsPromise> => {
  if (!uid) {
    return { success: false, data: null };
  }

  const ownerId = getOwnerId(uid, teamId);
  const result = await batchCreateInFirebase(uid, ownerId, details);
  return result;
};

const batchCreateInFirebase = async (
  uid: string,
  ownerId: string,
  details: {
    collectionId: RQAPI.CollectionRecord["id"];
    runConfigs?: Record<string, SavedRunConfig>;
    runResults?: RunResult[];
  }[]
): Promise<RQAPI.RecordsPromise> => {
  try {
    details.forEach((record) => {
      const { runConfigs = {}, runResults = [], collectionId } = record;

      if (Object.keys(runConfigs).length === 0) {
        return;
      }

      Object.values(runConfigs).forEach(async (runConfig) => {
        await upsertRunConfig(collectionId, runConfig);
      });

      if (runResults.length === 0) {
        return;
      }

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
