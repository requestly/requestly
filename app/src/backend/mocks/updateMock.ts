import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, updateDoc } from "firebase/firestore";
import { RQMockSchema } from "components/features/mocksV2/types";

import { updateUserMockSelectorsMap, uploadResponseBodyFiles } from "./common";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";

export const updateMock = async (
  uid: string,
  mockId: string,
  mockData: RQMockSchema
): Promise<boolean> => {
  if (!uid) {
    return null;
  }

  let responsesWithBody: any[] = [];
  if (BODY_IN_BUCKET_ENABLED) {
    responsesWithBody = [];
    // Update body to null and filePath
    mockData.responses.map((response) => {
      response.filePath = createResponseBodyFilepath(uid, mockId, response.id);
      responsesWithBody.push({ ...response });
      response.body = null;
      return null;
    });
  }

  const success = await updateMockFromFirebase(mockId, mockData).catch(
    () => false
  );

  if (success) {
    await updateUserMockSelectorsMap(uid, mockId, mockData);
    if (BODY_IN_BUCKET_ENABLED) {
      await uploadResponseBodyFiles(responsesWithBody, uid, mockId);
    }
    return true;
  }

  return false;
};

export const updateMockFromFirebase = async (
  mockId: string,
  mockData: RQMockSchema
): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const success = await updateDoc(docRef, {
    ...mockData,
    updatedTs: Timestamp.now().toMillis(),
  })
    .then(() => {
      return true;
    })
    .catch((err) => {
      return false;
    });

  return success;
};
