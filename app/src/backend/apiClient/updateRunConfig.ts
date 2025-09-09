import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, doc } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";

export async function updateRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<boolean> {
  const result = await _updateRunConfigInFirebase(collectionId, runConfigId, runConfig);
  return result;
}

async function _updateRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<boolean> {
  try {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "apis", collectionId, "runs", "configs", runConfigId);

    const updatedRunConfig = {
      ...runConfig,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.RunConfig;

    await updateDoc(docRef, updatedRunConfig);
    return { success: true, data: true };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigId, runConfigToUpdate: runConfig },
    });

    return { success: false, data: null, message: "Something went wrong!" };
  }
}
