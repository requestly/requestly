import { doc, getFirestore, Timestamp, writeBatch } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { APIS_NODE, EXAMPLES_REQUESTS_NODE } from "./constants";
import { RQAPI } from "features/apiClient/types";
import * as Sentry from "@sentry/react";

export const deleteExamples = async (uid: string, exampleRecords: RQAPI.ExampleApiRecord[], teamId?: string) => {
  try {
    const db = getFirestore(firebaseApp);
    const exampleRefs = exampleRecords.map((example) =>
      doc(db, APIS_NODE, example.parentRequestId, EXAMPLES_REQUESTS_NODE, example.id)
    );
    const batch = writeBatch(db);
    exampleRefs.forEach((exampleRef) => {
      batch.update(exampleRef, {
        deleted: true,
        updatedBy: uid,
        updatedTs: Timestamp.now().toMillis(),
      });
    });
    await batch.commit();

    return { success: true };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false };
  }
};
