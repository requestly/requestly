import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection } from "firebase/firestore";
import { RQMockSchema } from "components/features/mocksV2/types";
import { getOwnerId } from "backend/utils";
import { updateUserMockSelectorsMap, uploadResponseBodyFiles } from "./common";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";
import { updateMockFromFirebase } from "./updateMock";
import Logger from "lib/logger";

export const createMock = async (uid: string, mockData: RQMockSchema, teamId?: string): Promise<string> => {
  if (!uid) {
    return null;
  }
  const ownerId = getOwnerId(uid, teamId);

  let responsesWithBody: any[] = [];
  if (BODY_IN_BUCKET_ENABLED) {
    responsesWithBody = [];
    // Update body to null and filePath
    mockData.responses.forEach((response) => {
      response.filePath = "true"; // TODO: Assigning it true for now. This should be actual filePath of the bucket.
      responsesWithBody.push({ ...response });
      response.body = null;
    });
  }

  const mockId = await createMockFromFirebase(uid, mockData, teamId);

  if (mockId) {
    await updateUserMockSelectorsMap(ownerId, mockId, mockData);
    if (BODY_IN_BUCKET_ENABLED) {
      await uploadResponseBodyFiles(responsesWithBody, uid, mockId, teamId);
      mockData.id = mockId;
      updateResponseFilePath(uid, mockData, teamId);
    }

    return mockId;
  }

  return null;
};

const createMockFromFirebase = async (uid: string, mockData: RQMockSchema, teamId?: string): Promise<string | null> => {
  const db = getFirestore(firebaseApp);
  const rootMocksCollectionRef = collection(db, "mocks");

  const ownerId = getOwnerId(uid, teamId);

  const mockId: string | null = await addDoc(rootMocksCollectionRef, {
    ...mockData,
    createdBy: uid,
    ownerId: ownerId,
    deleted: false,
    createdTs: Timestamp.now().toMillis(),
    updatedTs: Timestamp.now().toMillis(),
  })
    .then((docRef) => {
      // TODO: Remove this. Only for testing the mocks bug in VPN
      console.log(`Mock document created ${docRef.id}`);
      updateDoc(docRef, {
        id: docRef.id,
      });
      return docRef.id;
    })
    .catch((err) => {
      Logger.error("error while creating mock", err);
      return null;
    });

  return mockId;
};

const updateResponseFilePath = async (uid: string, mockData: RQMockSchema, teamId?: string) => {
  mockData.responses.map((response) => {
    response.filePath = createResponseBodyFilepath(uid, mockData.id, response.id, teamId);
    return null;
  });

  await updateMockFromFirebase(uid, mockData.id, mockData);
};
