import firebaseApp from "../../firebase";
import { doc, getFirestore, Timestamp, updateDoc } from "firebase/firestore";
import { MockRecordType, RQMockSchema } from "components/features/mocksV2/types";
import { getOwnerId } from "backend/utils";
import { updateUserMockSelectorsMap, uploadResponseBodyFiles } from "./common";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";

export const updateMock = async (
  uid: string,
  mockId: string,
  mockData: RQMockSchema,
  teamId?: string
): Promise<boolean | null> => {
  if (!uid) {
    return null;
  }
  const ownerId = getOwnerId(uid, teamId);

  let responsesWithBody: any[] = [];
  if (BODY_IN_BUCKET_ENABLED && mockData?.recordType !== MockRecordType.COLLECTION) {
    responsesWithBody = [];
    // Update body to null and filePath
    mockData.responses.forEach((response) => {
      response.filePath = createResponseBodyFilepath(uid, mockId, response.id, teamId);
      responsesWithBody.push({ ...response });
      response.body = null;
    });
  }

  const success = await updateMockFromFirebase(uid, mockId, mockData).catch(() => false);

  if (success) {
    if (mockData?.recordType === MockRecordType.COLLECTION) {
      return true;
    }

    await updateUserMockSelectorsMap(ownerId, mockId, mockData);
    if (BODY_IN_BUCKET_ENABLED) {
      await uploadResponseBodyFiles(responsesWithBody, uid, mockId, teamId);
    }
    return true;
  }

  return false;
};

export const updateMockFromFirebase = async (
  updaterId: string,
  mockId: string,
  mockData: RQMockSchema
): Promise<boolean> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const success = await updateDoc(docRef, {
    recordType: MockRecordType.MOCK,
    ...mockData,
    lastUpdatedBy: updaterId,
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
