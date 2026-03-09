import { RQAPI } from "features/apiClient/types";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { getOwnerId } from "backend/utils";
import { sanitizeExample } from "./utils";
import { APIS_NODE, EXAMPLES_REQUESTS_NODE } from "./constants";
import * as Sentry from "@sentry/react";

export const updateExample = async (
  uid: string,
  example: RQAPI.ExampleApiRecord,
  teamId?: string
): RQAPI.ApiClientRecordPromise => {
  try {
    const db = getFirestore(firebaseApp);
    const ownerId = getOwnerId(uid, teamId);

    const sanitizedExample = sanitizeExample(example);

    const updatedExampleRecord = {
      ...sanitizedExample,
      deleted: false,
      ownerId,
      updatedBy: uid,
      updatedTs: Timestamp.now().toMillis(),
    } as RQAPI.ExampleApiRecord;

    const docRef = doc(db, APIS_NODE, example.parentRequestId, EXAMPLES_REQUESTS_NODE, example.id);
    await setDoc(docRef, updatedExampleRecord, { merge: true });
    return { success: true, data: updatedExampleRecord };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, data: null, message: "Failed to update example request" };
  }
};
