import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { RQAPI } from "features/apiClient/types";
import * as Sentry from "@sentry/react";
import { ResponsePromise } from "../types";
import { APIS_NODE, RUN_RESULT_NODE } from "./constants";
import {
  Iteration,
  IterationDetails,
  RunResult,
  SavedRunResult,
} from "features/apiClient/store/collectionRunResult/runResult.store";

export async function getRunResults(collectionId: RQAPI.ApiClientRecord["collectionId"]): ResponsePromise<RunResult[]> {
  const result = await _getRunResultsFromFirebase(collectionId);
  return result;
}

async function _getRunResultsFromFirebase(
  collectionId: RQAPI.ApiClientRecord["collectionId"]
): ResponsePromise<RunResult[]> {
  try {
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, APIS_NODE, collectionId, RUN_RESULT_NODE);
    const snapshot = await getDocs(collectionRef);

    const runResults: RunResult[] = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Omit<SavedRunResult, "id">;
      console.log("!!!debug", "data", data);
      const runResultMap = new Map<Iteration, IterationDetails>();
      data.result.forEach((item: IterationDetails, index: number) => {
        runResultMap.set(index + 1, item);
      });
      console.log("!!!debug", "runResultMap", runResultMap);
      runResults.push({ ...data, result: runResultMap }); // TODO check type here
    });

    return { success: true, data: runResults };
  } catch (e) {
    console.log("!!!debug", "get err", e);
    Sentry.captureException(e, {
      extra: { collectionId },
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
