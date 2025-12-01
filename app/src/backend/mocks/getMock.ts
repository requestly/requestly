import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { MockRecordType, RQMockSchema } from "components/features/mocksV2/types";
import { BODY_IN_BUCKET_ENABLED } from "./constants";
import { createResponseBodyFilepath } from "./utils";
import { getFile } from "services/firebaseStorageService";

export const getMock = async (uid: string, mockId: string, teamId?: string): Promise<RQMockSchema | null> => {
  if (!uid) {
    return null;
  }

  const mock = await getMockFromFirebase(mockId).catch((): null => null);

  // TODO: We can lazy load this in another call and show a loader
  if (BODY_IN_BUCKET_ENABLED && mock && mock?.recordType !== MockRecordType.COLLECTION) {
    await fetchResponsesBodyFromBucket(uid, mockId, mock.responses, teamId);
  }
  return mock;
};

const getMockFromFirebase = async (mockId: string): Promise<RQMockSchema | null> => {
  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "mocks", mockId);

  const snapshot = await getDoc(docRef);
  console.log("snapshot", snapshot.data());

  if (snapshot.exists()) {
    const data = snapshot.data() as RQMockSchema;
    return { ...data, id: snapshot.id };
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
