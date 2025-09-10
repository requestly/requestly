import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, doc, addDoc, collection, getDoc, setDoc } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";
import { APIS_NODE, RUN_CONFIGS_NODE } from "./constants";

export async function upsertRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<RQAPI.RunConfig | Partial<RQAPI.RunConfig>> {
  let result;

  if (!runConfig.id) {
    result = await _createRunConfigInFirebase(collectionId, runConfig);
  } else {
    result = await _upsertRunConfigInFirebase(collectionId, runConfig);
  }

  return result;
}

async function _createRunConfigInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfig: Partial<RQAPI.RunConfig>
): ResponsePromise<RQAPI.RunConfig> {
  try {
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, APIS_NODE, collectionId, RUN_CONFIGS_NODE);

    const timeStamp = Timestamp.now().toMillis();
    const newRunConfig = {
      ...runConfig,
      createdTs: timeStamp,
      updatedTs: timeStamp,
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
    return { success: true, data: { ...snapshot.data(), ...updatedRunConfig, id: runConfig.id } };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigToUpdate: runConfig },
    });

    return { success: false, data: null, message: "Something went wrong!" };
  }
}
