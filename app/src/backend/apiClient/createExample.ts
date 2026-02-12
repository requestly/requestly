import { RQAPI } from "features/apiClient/types";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { APIS_NODE, EXAMPLES_REQUESTS_NODE } from "./constants";
import { getOwnerId } from "backend/utils";
import lodash from "lodash";

const sanitizeExample = (example: RQAPI.ExampleApiRecord) => {
  const sanitizedExample = lodash.cloneDeep(example);
  delete sanitizedExample.data.testResults;
  return sanitizedExample;
};

export const createExample = async (
  uid: string,
  parentRequestId: string,
  example: RQAPI.ExampleApiRecord,
  teamId?: string
) => {
  const db = getFirestore(firebaseApp);
  const examplesRef = collection(db, APIS_NODE, parentRequestId, EXAMPLES_REQUESTS_NODE);
  const ownerId = getOwnerId(uid, teamId);

  const sanitizedExample = sanitizeExample(example);

  const newExampleRecord: RQAPI.ExampleApiRecord = {
    ...sanitizedExample,
    ownerId,
    deleted: false,
    createdBy: uid,
    updatedBy: uid,
    createdTs: Timestamp.now().toMillis(),
    updatedTs: Timestamp.now().toMillis(),
  };
  const result = await addDoc(examplesRef, newExampleRecord);
  return { success: true, data: { ...newExampleRecord, id: result.id } };
};
