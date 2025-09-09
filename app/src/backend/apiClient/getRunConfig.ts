import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import * as Sentry from "@sentry/react";
import { ResponsePromise } from "../types";

export async function getRunConfig(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"]
): ResponsePromise<RQAPI.RunConfig> {
  const result = await _getRunConfigFromFirebase(collectionId, runConfigId);
  return result;
}

async function _getRunConfigFromFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runConfigId: RQAPI.RunConfig["id"]
): ResponsePromise<RQAPI.RunConfig> {
  try {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "apis", collectionId, "runs", "configs", runConfigId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return { success: false, data: null, message: "Not found!" };
    }

    return { success: true, data: snapshot.data() as RQAPI.RunConfig };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runConfigId },
    });

    return { success: false, data: null, message: "Something went wrong!" };
  }
}
