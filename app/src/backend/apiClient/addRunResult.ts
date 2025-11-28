import firebaseApp from "../../firebase";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import { ResponsePromise } from "backend/types";
import * as Sentry from "@sentry/react";
import { APIS_NODE, RUN_RESULT_NODE } from "./constants";
import { RunResult, SavedRunResult } from "features/apiClient/store/collectionRunResult/runResult.store";

export async function addRunResult(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runResult: RunResult
): ResponsePromise<SavedRunResult> {
  const result = await _addRunResultInFirebase(collectionId, runResult);
  return result;
}

async function _addRunResultInFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"],
  runResult: RunResult
): ResponsePromise<SavedRunResult> {
  try {
    if (!collectionId) {
      throw new Error("Collection ID is required to add run result");
    }
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, APIS_NODE, collectionId, RUN_RESULT_NODE);

    const resultArray = Array.from(runResult.iterations.values());

    const runResultForSave = {
      ...runResult,
      iterations: resultArray,
    };

    const docRef = await addDoc(collectionRef, runResultForSave);

    const savedRunResult = {
      ...runResultForSave,
      id: docRef.id,
    } as SavedRunResult;

    return { success: true, data: savedRunResult };
  } catch (e) {
    Sentry.captureException(e, {
      extra: { collectionId, runResult },
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
