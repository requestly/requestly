import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";
import { APIS_NODE, RUN_CONFIGS_NODE } from "./constants";

export async function upsertRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<RQAPI.RunConfig | Partial<RQAPI.RunConfig>> {
  const result = await _upsertRunConfigInFirebase(collectionId, runConfig);
  return result;
}

async function _upsertRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<Partial<RQAPI.RunConfig>> {
  try {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, APIS_NODE, collectionId, RUN_CONFIGS_NODE, runConfig.id);

    // remove id
    const { id: runConfigId, ...rest } = runConfig;

    const timeStamp = Timestamp.now().toMillis();
    const updatedRunConfig = {
      ...rest,
      updatedTs: timeStamp,
    } as RQAPI.RunConfig;

    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      updatedRunConfig.createdTs = timeStamp;
    }

    await setDoc(docRef, updatedRunConfig, { merge: true });
    return { success: true, data: { ...(snapshot.data() ?? {}), ...updatedRunConfig, id: runConfig.id } };
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
