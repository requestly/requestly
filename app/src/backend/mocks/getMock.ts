import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { RQMockSchema } from "components/features/mocksV2/types";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";
import { getFile } from "services/firebaseStorageService";

export const getMock = async (uid: string, mockId: string, teamId?: string): Promise<RQMockSchema> => {
  if (!uid) {
    return null;
  }

  const mock = await getMockFromFirebase(mockId).catch(() => null);

  // TODO: We can lazy load this in another call and show a loader
  if (BODY_IN_BUCKET_ENABLED && mock) {
    await fetchResponsesBodyFromBucket(uid, mockId, mock.responses, teamId);
  }
  return mock;
};

const getMockFromFirebase = async (mockId: string): Promise<RQMockSchema> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as RQMockSchema;
    return data;
  } else {
    return null;
  }
};

const fetchResponsesBodyFromBucket = async (uid: string, mockId: string, responses: any[], teamId?: string) => {
  await Promise.all(
    responses.map(async (response) => {
      // Only fetch from file if filePath exists
      if (response?.filePath) {
        const filePath = createResponseBodyFilepath(uid, mockId, response.id, teamId);
        const body = await getFile(filePath);
        response.body = body;
      }
    })
  );

  return responses;
};
