import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import * as Sentry from "@sentry/react";
import { ResponsePromise } from "../types";
import { APIS_NODE, RUN_CONFIGS_NODE } from "./constants";
import { SavedRunConfig, SavedRunConfigRecord } from "features/apiClient/commands/collectionRunner/types";

export async function getRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"]
): ResponsePromise<SavedRunConfig> {
  const result = await _getRunConfigFromFirebase(collectionId, runConfigId);
  return result;
}

async function _getRunConfigFromFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"]
): ResponsePromise<SavedRunConfig> {
  try {
    if (!collectionId) {
      throw new Error("Collection ID is required");
    }

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, APIS_NODE, collectionId, RUN_CONFIGS_NODE, runConfigId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        data: null,
        error: {
          type: "NOT_FOUND",
          message: "Not found!",
        },
      };
    }

    const data = snapshot.data() as SavedRunConfigRecord;
    return {
      success: true,
      data: {
        id: runConfigId,
        runOrder: data.runOrder,
        delay: data.delay ?? 0,
        iterations: data.iterations ?? 1,
        dataFile: data.dataFile ?? null,
      },
    };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigId },
    });

    return {
      success: false,
      data: null,
      error: {
        type: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong!",
      },
    };
  }
}
