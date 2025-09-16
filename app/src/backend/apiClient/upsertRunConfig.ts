import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";
import { APIS_NODE, RUN_CONFIGS_NODE } from "./constants";
import { FetchedRunConfig, SaveRunConfig } from "features/apiClient/commands/collectionRunner/types";

export async function upsertRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  configId: RQAPI.RunConfig["id"],
  runConfig: SaveRunConfig
): ResponsePromise<FetchedRunConfig> {
  const result = await _upsertRunConfigInFirebase(collectionId, configId, runConfig);
  return result;
}

async function _upsertRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  configId: RQAPI.RunConfig["id"],
  runConfig: SaveRunConfig
): ResponsePromise<FetchedRunConfig> {
  try {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, APIS_NODE, collectionId, RUN_CONFIGS_NODE, configId);

    const timeStamp = Timestamp.now().toMillis();
    const updatedRunConfig = {
      ...runConfig,
      updatedTs: timeStamp,
    } as RQAPI.RunConfig;

    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      updatedRunConfig.createdTs = timeStamp;
    }

    await setDoc(docRef, updatedRunConfig, { merge: true });
    return { success: true, data: { ...(snapshot.data() ?? {}), ...updatedRunConfig, id: configId } };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigToUpdate: runConfig },
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
