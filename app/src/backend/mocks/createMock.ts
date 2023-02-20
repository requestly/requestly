import firebaseApp from "../../firebase";
import {
  getFirestore,
  Timestamp,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { RQMockSchema } from "components/features/mocksV2/types";

import { updateUserMockSelectorsMap, uploadResponseBodyFiles } from "./common";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";
import { updateMockFromFirebase } from "./updateMock";

export const createMock = async (
  uid: string,
  mockData: RQMockSchema
): Promise<string> => {
  if (!uid) {
    return null;
  }

  let responsesWithBody: any[] = [];
  if (BODY_IN_BUCKET_ENABLED) {
    responsesWithBody = [];
    // Update body to null and filePath
    mockData.responses.map((response) => {
      response.filePath = "true"; // TODO: Assigning it true for now. This should be actual filePath of the bucket.
      responsesWithBody.push({ ...response });
      response.body = null;
      return null;
    });
  }

  const mockId = await createMockFromFirebase(uid, mockData);

  if (mockId) {
    await updateUserMockSelectorsMap(uid, mockId, mockData);
    if (BODY_IN_BUCKET_ENABLED) {
      await uploadResponseBodyFiles(responsesWithBody, uid, mockId);
      mockData.id = mockId;
      updateResponseFilePath(uid, mockData);
    }

    return mockId;
  }

  return null;
};

const createMockFromFirebase = async (
  uid: string,
  mockData: RQMockSchema
): Promise<string | null> => {
  const db = getFirestore(firebaseApp);
  const rootMocksCollectionRef = collection(db, "mocks");

  const mockId: string | null = await addDoc(rootMocksCollectionRef, {
    ...mockData,
    ownerId: uid,
    deleted: false,
    createdTs: Timestamp.now().toMillis(),
    updatedTs: Timestamp.now().toMillis(),
  })
    .then((docRef) => {
      updateDoc(docRef, {
        id: docRef.id,
      });
      return docRef.id;
    })
    .catch((err) => {
      return null;
    });

  return mockId;
};

const updateResponseFilePath = async (uid: string, mockData: RQMockSchema) => {
  mockData.responses.map((response) => {
    response.filePath = createResponseBodyFilepath(
      uid,
      mockData.id,
      response.id
    );
    return null;
  });

  await updateMockFromFirebase(mockData.id, mockData);
};
