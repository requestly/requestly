import firebaseApp from "../../firebase";
import { getFirestore, Timestamp, updateDoc, addDoc, collection } from "firebase/firestore";
import { getOwnerId } from "backend/utils";
import Logger from "lib/logger";
import { MockRecordType, RQMockCollection } from "components/features/mocksV2/types";

type MockCollectionData = Pick<RQMockCollection, "name" | "desc" | "type">;

export const createCollection = async (
  uid: string,
  mockCollectionData: MockCollectionData,
  teamId?: string
): Promise<RQMockCollection | null> => {
  if (!uid) {
    return null;
  }

  const mockCollection = await createCollectionInFirebase(uid, mockCollectionData, teamId);

  return mockCollection;
};

const createCollectionInFirebase = async (
  uid: string,
  mockCollectionData: MockCollectionData,
  teamId?: string
): Promise<RQMockCollection | null> => {
  const db = getFirestore(firebaseApp);
  const mocksRef = collection(db, "mocks");
  const ownerId = getOwnerId(uid, teamId);

  try {
    const collectionData: RQMockCollection = {
      ...mockCollectionData,
      recordType: MockRecordType.COLLECTION,
      ownerId: ownerId,
      deleted: false,
      createdBy: uid,
      lastUpdatedBy: uid,
      createdTs: Timestamp.now().toMillis(),
      updatedTs: Timestamp.now().toMillis(),
    };

    const docRef = await addDoc(mocksRef, collectionData);

    Logger.log(`Mock collection document created ${docRef.id}`);

    await updateDoc(docRef, { id: docRef.id });

    return { ...collectionData, id: docRef.id } as RQMockCollection;
  } catch (err) {
    Logger.error("Error while creating mock collection", err);
    return null;
  }
};
