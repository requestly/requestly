import { RQAPI } from "features/apiClient/types";
import { collection, doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { APIS_NODE, EXAMPLES_REQUESTS_NODE } from "./constants";
import { getOwnerId } from "backend/utils";
import * as Sentry from "@sentry/react";
import { sanitizeExample } from "./utils";

export const createExample = async (
  uid: string,
  parentRequestId: string,
  example: RQAPI.ExampleApiRecord,
  teamId?: string
): RQAPI.ApiClientRecordPromise => {
  try {
    const db = getFirestore(firebaseApp);
    const examplesRef = collection(db, APIS_NODE, parentRequestId, EXAMPLES_REQUESTS_NODE);
    const ownerId = getOwnerId(uid, teamId);

    const sanitizedExample = sanitizeExample(example);
    delete sanitizedExample?.id;

    const newExampleRecord: Partial<RQAPI.ExampleApiRecord> = {
      ...sanitizedExample,
      ownerId,
      deleted: false,
      createdBy: uid,
      updatedBy: uid,
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    };
    const docRef = doc(examplesRef);
    const createdRecord = { ...newExampleRecord, id: docRef.id } as RQAPI.ExampleApiRecord;
    await setDoc(docRef, createdRecord);

    return { success: true, data: createdRecord };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, data: null, message: "Failed to create example request" };
  }
};
