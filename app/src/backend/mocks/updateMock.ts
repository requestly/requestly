import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, updateDoc } from "firebase/firestore";
import { RQMockSchema } from "components/features/mocksV2/types";

import {
  getOwnerId,
  updateUserMockSelectorsMap,
  uploadResponseBodyFiles,
} from "./common";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";

export const updateMock = async (
  uid: string,
  mockId: string,
  mockData: RQMockSchema,
  teamId?: string
): Promise<boolean> => {
  if (!uid) {
    return null;
  }
  const ownerId = getOwnerId(uid, teamId);

  let responsesWithBody: any[] = [];
  if (BODY_IN_BUCKET_ENABLED) {
    responsesWithBody = [];
    // Update body to null and filePath
    mockData.responses.map((response) => {
      response.filePath = createResponseBodyFilepath(
        uid,
        mockId,
        response.id,
        teamId
      );
      responsesWithBody.push({ ...response });
      response.body = null;
      return null;
    });
  }

  const success = await updateMockFromFirebase(mockId, mockData, uid).catch(
    () => false
  );

  if (success) {
    await updateUserMockSelectorsMap(ownerId, mockId, mockData);
    if (BODY_IN_BUCKET_ENABLED) {
      await uploadResponseBodyFiles(responsesWithBody, uid, mockId, teamId);
    }
    return true;
  }

  return false;
};

export const updateMockFromFirebase = async (
  mockId: string,
  mockData: RQMockSchema,
  uid: string
): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const success = await updateDoc(docRef, {
    lastModifiedBy: uid,
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
