import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, doc, addDoc, collection } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";

export async function upsertRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<RQAPI.RunConfig | Partial<RQAPI.RunConfig>> {
  let result;

  if (!runConfig.id) {
    result = await _createRunConfigInFirebase(collectionId, runConfig);
  } else {
    result = await _updateRunConfigInFirebase(collectionId, runConfig);
  }

  return result;
}

async function _createRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<RQAPI.RunConfig> {
  try {
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, "apis", collectionId, "runs", "configs");

    const newRunConfig = {
      ...runConfig,
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.RunConfig;

    const resultDocRef = await addDoc(collectionRef, newRunConfig);

    return { success: true, data: { ...newRunConfig, id: resultDocRef.id } as RQAPI.RunConfig };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigToSave: runConfig },
    });

    return { success: false, data: null, message: "Something went wrong!" };
  }
}

async function _updateRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<Partial<RQAPI.RunConfig>> {
  try {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "apis", collectionId, "runs", "configs", runConfig.id);

    const updatedRunConfig = {
      ...runConfig,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.RunConfig;

    await updateDoc(docRef, updatedRunConfig);
    return { success: true, data: updatedRunConfig };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigToUpdate: runConfig },
    });

    return { success: false, data: null, message: "Something went wrong!" };
  }
}
